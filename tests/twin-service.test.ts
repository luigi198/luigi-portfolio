import { describe, expect, it } from "vitest";
import { createTwinService, MAX_STRIKES, type TwinDeps } from "@/twin/service";
import { buildSystemPrompt } from "@/twin/prompt";
import { MAX_OUTPUT_TOKENS } from "@/twin/policy";
import { REPLIES } from "@/content/twin/replies";
import type { LogFields, ModelEvent, ModelRequest, StopReason, Usage } from "@/twin/ports";
import type { ChatChunk, ChatTurn, TwinOutcome, TwinRequest } from "@/twin/types";

const SECRET_TEXT = "my-private-question-7f3a";
const usage = (costUsd: number): Usage => ({ inputTokens: 10, outputTokens: 5, cacheReadTokens: 6000, cacheWriteTokens: 0, costUsd });

/** In-memory stand-ins for the process boundaries (Anthropic, Redis, BotID, logs). */
function fakes(overrides: { reply?: string[]; stopReason?: StopReason; streamError?: Error } = {}) {
  const state = {
    bot: false,
    rateAllowed: true,
    strikes: new Map<string, number>(),
    spent: 0,
    screenAllowed: true,
    storeDown: false,
    modelCalls: [] as ModelRequest[],
    screenCalls: [] as (readonly ChatTurn[])[],
    logs: [] as { level: string; event: string; fields: LogFields }[],
  };
  const down = () => {
    if (state.storeDown) throw new Error("ECONNREFUSED");
  };
  const log = (level: string) => (event: string, fields: LogFields) => state.logs.push({ level, event, fields });
  const deps: TwinDeps = {
    bot: { isBot: async () => state.bot },
    rateLimiter: { allow: async () => (down(), state.rateAllowed) },
    offenders: {
      strikes: async (id) => (down(), state.strikes.get(id) ?? 0),
      addStrike: async (id) => void state.strikes.set(id, (state.strikes.get(id) ?? 0) + 1),
    },
    budget: {
      spentTodayUsd: async () => (down(), state.spent),
      addSpendUsd: async (n) => void (state.spent += n),
    },
    screener: {
      screen: async (turns) => (state.screenCalls.push(turns), { allowed: state.screenAllowed, usage: usage(0.0001) }),
    },
    model: {
      async *stream(request): AsyncIterable<ModelEvent> {
        state.modelCalls.push(request);
        for (const text of overrides.reply ?? ["Hi, ", "I'm Luis."]) yield { type: "text", text };
        if (overrides.streamError) throw overrides.streamError;
        yield { type: "end", stopReason: overrides.stopReason ?? "end_turn", usage: usage(0.01) };
      },
    },
    logger: { info: log("info"), warn: log("warn"), error: log("error") },
    clock: { now: () => 1000 },
    dailyBudgetUsd: 5,
  };
  return { state, deps };
}

const request = (over: Partial<TwinRequest> = {}): TwinRequest => ({
  requestId: "req-1",
  visitorId: "visitor-hash",
  locale: "en",
  history: [],
  message: SECRET_TEXT,
  ...over,
});

async function collect(outcome: TwinOutcome): Promise<ChatChunk[]> {
  if (outcome.kind !== "answered") throw new Error(`expected an answer, got ${outcome.kind}`);
  const chunks: ChatChunk[] = [];
  for await (const chunk of outcome.chunks) chunks.push(chunk);
  return chunks;
}

describe("twin service", () => {
  it("streams the model's answer to a valid message", async () => {
    const { state, deps } = fakes();
    const chunks = await collect(await createTwinService(deps).handle(request()));
    expect(chunks).toEqual([{ type: "delta", text: "Hi, " }, { type: "delta", text: "I'm Luis." }]);
    expect(state.modelCalls).toEqual([
      { system: buildSystemPrompt(), turns: [{ role: "user", text: SECRET_TEXT }], maxTokens: MAX_OUTPUT_TOKENS },
    ]);
  });

  it("screens the whole conversation, including history the browser sent", async () => {
    const { state, deps } = fakes();
    const history: ChatTurn[] = [{ role: "user", text: "a" }, { role: "assistant", text: "b" }];
    await collect(await createTwinService(deps).handle(request({ history })));
    expect(state.screenCalls).toEqual([[...history, { role: "user", text: SECRET_TEXT }]]);
  });

  it("adds the screen and answer cost to today's spend", async () => {
    const { state, deps } = fakes();
    await collect(await createTwinService(deps).handle(request()));
    expect(state.spent).toBeCloseTo(0.0101);
  });

  it("logs metadata, including cache hits, but never the visitor's text", async () => {
    const { state, deps } = fakes();
    await collect(await createTwinService(deps).handle(request()));
    const answered = state.logs.find((l) => l.event === "twin.answered");
    expect(answered?.fields).toMatchObject({ requestId: "req-1", visitorId: "visitor-hash", cacheReadTokens: 6000, stopReason: "end_turn" });
    expect(JSON.stringify(state.logs)).not.toContain(SECRET_TEXT);
  });

  it("stops bots before any other check or model call", async () => {
    const { state, deps } = fakes();
    state.bot = true;
    expect(await createTwinService(deps).handle(request())).toEqual({ kind: "blocked" });
    expect(state.screenCalls).toHaveLength(0);
    expect(state.modelCalls).toHaveLength(0);
  });

  it("limits a visitor over the rate limit", async () => {
    const { state, deps } = fakes();
    state.rateAllowed = false;
    expect(await createTwinService(deps).handle(request())).toEqual({ kind: "limited" });
    expect(state.modelCalls).toHaveLength(0);
  });

  it("cools off a visitor with too many blocked messages", async () => {
    const { state, deps } = fakes();
    state.strikes.set("visitor-hash", MAX_STRIKES);
    expect(await createTwinService(deps).handle(request())).toEqual({ kind: "limited" });
  });

  it("rejects an invalid conversation without calling the screen", async () => {
    const { state, deps } = fakes();
    expect(await createTwinService(deps).handle(request({ message: " " }))).toEqual({ kind: "invalid", problem: "empty-message" });
    expect(state.screenCalls).toHaveLength(0);
  });

  it("hands off to booking at the turn cap", async () => {
    const { deps } = fakes();
    const history = Array.from({ length: 10 }, (): ChatTurn[] => [{ role: "user", text: "q" }, { role: "assistant", text: "a" }]).flat();
    expect(await createTwinService(deps).handle(request({ history }))).toEqual({ kind: "conversation-cap" });
  });

  it("closes for the day once the budget is spent", async () => {
    const { state, deps } = fakes();
    state.spent = deps.dailyBudgetUsd;
    expect(await createTwinService(deps).handle(request())).toEqual({ kind: "over-budget" });
    expect(state.screenCalls).toHaveLength(0);
  });

  it("answers a screened-out message with the fixed redirect line and a strike", async () => {
    const { state, deps } = fakes();
    state.screenAllowed = false;
    const outcome = await createTwinService(deps).handle(request({ locale: "es" }));
    expect(outcome).toEqual({ kind: "refused", text: REPLIES.redirect.es });
    expect(state.strikes.get("visitor-hash")).toBe(1);
    expect(state.modelCalls).toHaveLength(0);
  });

  it("replaces a refused answer with the redirect line and records a strike", async () => {
    const { state, deps } = fakes({ reply: ["Partial"], stopReason: "refusal" });
    const chunks = await collect(await createTwinService(deps).handle(request()));
    expect(chunks.at(-1)).toEqual({ type: "replace", text: REPLIES.redirect.en });
    expect(state.strikes.get("visitor-hash")).toBe(1);
  });

  it("fails closed when a store is unreachable", async () => {
    const { state, deps } = fakes();
    state.storeDown = true;
    expect(await createTwinService(deps).handle(request())).toEqual({ kind: "unavailable" });
    expect(state.modelCalls).toHaveLength(0);
    expect(state.logs.find((l) => l.level === "error")?.fields).toMatchObject({ requestId: "req-1", errorClass: "Error" });
  });

  it("ends the stream with an error chunk if the model fails midway", async () => {
    const { state, deps } = fakes({ streamError: new TypeError("socket hang up") });
    const chunks = await collect(await createTwinService(deps).handle(request()));
    expect(chunks.at(-1)).toEqual({ type: "error" });
    expect(state.logs.find((l) => l.level === "error")?.fields).toMatchObject({ errorClass: "TypeError" });
  });
});
