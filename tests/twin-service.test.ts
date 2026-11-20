import { describe, expect, it } from "vitest";
import { createTwinService, MAX_STRIKES } from "@/twin/service";
import { buildSystemPrompt } from "@/twin/prompt";
import { MAX_OUTPUT_TOKENS } from "@/twin/policy";
import { REPLIES } from "@/content/twin/replies";
import type { ChatTurn } from "@/twin/types";
import { SCREEN_COST, SECRET_TEXT, collect, fakes, request } from "./helpers/twin-fakes";

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



  it("answers a screened-out message with the fixed redirect line and a strike", async () => {
    const { state, deps } = fakes();
    state.screenVerdict = "blocked";
    const outcome = await createTwinService(deps).handle(request({ locale: "es" }));
    expect(outcome).toEqual({ kind: "refused", text: REPLIES.redirect.es });
    expect(state.strikes.get("visitor-hash")).toBe(1);
    expect(state.modelCalls).toHaveLength(0);
    expect(state.spent).toBeCloseTo(SCREEN_COST);
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
