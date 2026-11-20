import type { LogFields, ModelEvent, ModelRequest, StopReason, Usage } from "@/twin/ports";
import type { TwinDeps } from "@/twin/service";
import type { ChatChunk, ChatTurn, TwinOutcome, TwinRequest } from "@/twin/types";

/** In-memory stand-ins for the twin service's process boundaries (Anthropic, Redis, BotID, logs). */
export const SECRET_TEXT = "my-private-question-7f3a";
const usage = (costUsd: number): Usage => ({ inputTokens: 10, outputTokens: 5, cacheReadTokens: 6000, cacheWriteTokens: 0, costUsd });

/** Worst-case cost the fake model reports; the real adapter derives it from the prompt size. */
export const RESERVED = 0.2;
export const SCREEN_COST = 0.0001;
export const ANSWER_COST = 0.01;

interface FakeOptions {
  reply?: string[];
  stopReason?: StopReason;
  /** Fails after the answer started (billed) unless `failBeforeStart` is set (rejected, not billed). */
  streamError?: Error;
  failBeforeStart?: boolean;
}

export function fakes(overrides: FakeOptions = {}) {
  const state = {
    bot: false,
    rateAllowed: true,
    strikes: new Map<string, number>(),
    spent: 0,
    screenVerdict: "allowed" as "allowed" | "blocked" | "unreadable",
    screenDown: false,
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
      reserve: async (amount, limit) => {
        down();
        if (state.spent >= limit) return false;
        state.spent += amount;
        return true;
      },
      addSpendUsd: async (n) => void (state.spent += n),
    },
    screener: {
      screen: async (turns) => {
        state.screenCalls.push(turns);
        if (state.screenDown) throw new Error("ETIMEDOUT");
        return { verdict: state.screenVerdict, usage: usage(SCREEN_COST) };
      },
    },
    model: {
      maxCostUsd: () => RESERVED,
      async *stream(request): AsyncIterable<ModelEvent> {
        state.modelCalls.push(request);
        if (overrides.streamError && overrides.failBeforeStart) throw overrides.streamError;
        yield { type: "started" };
        for (const text of overrides.reply ?? ["Hi, ", "I'm Luis."]) yield { type: "text", text };
        if (overrides.streamError) throw overrides.streamError;
        yield { type: "end", stopReason: overrides.stopReason ?? "end_turn", usage: usage(ANSWER_COST) };
      },
    },
    logger: { info: log("info"), warn: log("warn"), error: log("error") },
    clock: { now: () => 1000 },
    dailyBudgetUsd: 5,
  };
  return { state, deps };
}

export const request = (over: Partial<TwinRequest> = {}): TwinRequest => ({
  requestId: "req-1",
  visitorId: "visitor-hash",
  locale: "en",
  history: [],
  message: SECRET_TEXT,
  ...over,
});

export async function collect(outcome: TwinOutcome): Promise<ChatChunk[]> {
  if (outcome.kind !== "answered") throw new Error(`expected an answer, got ${outcome.kind}`);
  const chunks: ChatChunk[] = [];
  for await (const chunk of outcome.chunks) chunks.push(chunk);
  return chunks;
}

