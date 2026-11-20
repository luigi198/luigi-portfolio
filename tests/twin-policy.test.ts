import { describe, expect, it } from "vitest";
import { MAX_ASSISTANT_CHARS, MAX_MESSAGE_CHARS, MAX_USER_TURNS, checkConversation } from "@/twin/policy";
import type { ChatTurn } from "@/twin/types";

const user = (text = "hi"): ChatTurn => ({ role: "user", text });
const bot = (text = "hello"): ChatTurn => ({ role: "assistant", text });
/** A valid history with `n` earlier exchanges. */
const exchanges = (n: number) => Array.from({ length: n }, () => [user(), bot()]).flat();

describe("checkConversation", () => {
  it("accepts a first message and returns it as the last turn", () => {
    expect(checkConversation([], "  What do you do?  ")).toEqual({
      ok: true,
      turns: [{ role: "user", text: "What do you do?" }],
    });
  });

  it("keeps earlier turns in order before the new message", () => {
    const result = checkConversation([user("a"), bot("b")], "c");
    expect(result).toEqual({ ok: true, turns: [user("a"), bot("b"), user("c")] });
  });

  it("rejects an empty or blank message", () => {
    expect(checkConversation([], "   ")).toEqual({ ok: false, problem: "empty-message" });
  });

  it("caps the message length, counting the trimmed text", () => {
    expect(checkConversation([], "x".repeat(MAX_MESSAGE_CHARS)).ok).toBe(true);
    expect(checkConversation([], ` ${"x".repeat(MAX_MESSAGE_CHARS)} `).ok).toBe(true);
    expect(checkConversation([], "x".repeat(MAX_MESSAGE_CHARS + 1))).toEqual({ ok: false, problem: "message-too-long" });
  });

  it("rejects history that doesn't alternate user, assistant", () => {
    for (const history of [[user(), user()], [bot()], [user()], [user(), bot(), bot()]]) {
      expect(checkConversation(history, "next")).toEqual({ ok: false, problem: "invalid-history" });
    }
  });

  it("re-checks lengths in history the browser sent", () => {
    expect(checkConversation([user("x".repeat(MAX_MESSAGE_CHARS + 1)), bot()], "next").ok).toBe(false);
    expect(checkConversation([user(), bot("x".repeat(MAX_ASSISTANT_CHARS + 1))], "next").ok).toBe(false);
    expect(checkConversation([user(""), bot()], "next").ok).toBe(false);
  });

  it("allows the last message up to the turn cap, then asks to hand off", () => {
    expect(checkConversation(exchanges(MAX_USER_TURNS - 1), "last").ok).toBe(true);
    expect(checkConversation(exchanges(MAX_USER_TURNS), "one more")).toEqual({ ok: false, problem: "turn-cap" });
  });
});
