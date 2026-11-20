import { describe, expect, it } from "vitest";
import { createTwinService } from "@/twin/service";
import { ANSWER_COST, RESERVED, SCREEN_COST, collect, fakes, request } from "./helpers/twin-fakes";

/** Spend accounting: every path that can be billed is counted, and nothing else (research A6). */
describe("twin service budget", () => {
  it("reserves the worst case before the screen, then settles to the real screen and answer cost", async () => {
    const { state, deps } = fakes();
    const outcome = await createTwinService(deps).handle(request());
    expect(state.spent).toBeCloseTo(RESERVED + SCREEN_COST);
    await collect(outcome);
    expect(state.spent).toBeCloseTo(SCREEN_COST + ANSWER_COST);
  });
  it("keeps the reservation when the visitor disconnects mid-answer, since the model may have billed", async () => {
    const { state, deps } = fakes();
    const outcome = await createTwinService(deps).handle(request());
    if (outcome.kind !== "answered") throw new Error("expected an answer");
    const iterator = outcome.chunks[Symbol.asyncIterator]();
    await iterator.next();
    await iterator.return?.();
    expect(state.spent).toBeCloseTo(RESERVED + SCREEN_COST);
    expect(state.logs.find((l) => l.event === "twin.cut_off")?.fields).toMatchObject({ reservedUsd: RESERVED });
  });
  it("keeps the reservation when the model fails after it started", async () => {
    const { state, deps } = fakes({ streamError: new TypeError("socket hang up") });
    await collect(await createTwinService(deps).handle(request()));
    expect(state.spent).toBeCloseTo(RESERVED + SCREEN_COST);
  });
  it("releases the reservation when the model rejects the request before starting", async () => {
    const { state, deps } = fakes({ streamError: new Error("overloaded"), failBeforeStart: true });
    const chunks = await collect(await createTwinService(deps).handle(request()));
    expect(chunks).toEqual([{ type: "error" }]);
    expect(state.spent).toBeCloseTo(SCREEN_COST);
  });
  it("ends an answer with no text in an error chunk, so the visitor isn't left waiting", async () => {
    const { state, deps } = fakes({ reply: [], stopReason: "max_tokens" });
    const chunks = await collect(await createTwinService(deps).handle(request()));
    expect(chunks).toEqual([{ type: "error" }]);
    expect(state.spent).toBeCloseTo(SCREEN_COST + ANSWER_COST);
  });
  it("records the screen's cost and releases the reservation when its verdict is unreadable", async () => {
    const { state, deps } = fakes();
    state.screenVerdict = "unreadable";
    expect(await createTwinService(deps).handle(request())).toEqual({ kind: "unavailable" });
    expect(state.spent).toBeCloseTo(SCREEN_COST);
    expect(state.strikes.get("visitor-hash")).toBeUndefined();
    expect(state.modelCalls).toHaveLength(0);
  });
  it("releases the reservation when the screen can't be reached", async () => {
    const { state, deps } = fakes();
    state.screenDown = true;
    expect(await createTwinService(deps).handle(request())).toEqual({ kind: "unavailable" });
    expect(state.spent).toBeCloseTo(0);
  });
  it("closes for the day once the budget is spent", async () => {
    const { state, deps } = fakes();
    state.spent = deps.dailyBudgetUsd;
    expect(await createTwinService(deps).handle(request())).toEqual({ kind: "over-budget" });
    expect(state.screenCalls).toHaveLength(0);
  });
});
