import { describe, expect, it } from "vitest";
import { failureFrom, readChunks } from "@/components/twin/stream";
import { chatReducer, historyOf, initialChat, questionsLeft } from "@/components/twin/chat-state";
import { MAX_USER_TURNS } from "@/twin/policy";
import type { ChatChunk } from "@/twin/types";

/** A body that arrives in arbitrary pieces, like a real network stream. */
function bodyOf(...pieces: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const p of pieces) controller.enqueue(encoder.encode(p));
      controller.close();
    },
  });
}

async function all(body: ReadableStream<Uint8Array>): Promise<ChatChunk[]> {
  const out: ChatChunk[] = [];
  for await (const c of readChunks(body)) out.push(c);
  return out;
}

describe("readChunks", () => {
  it("parses one chunk per line, even when lines are split across reads", async () => {
    const chunks = await all(bodyOf('{"type":"delta","te', 'xt":"Hi"}\n{"type":"delta","text":"!"}', "\n"));
    expect(chunks).toEqual([{ type: "delta", text: "Hi" }, { type: "delta", text: "!" }]);
  });

  it("keeps multi-byte characters intact across reads", async () => {
    const bytes = new TextEncoder().encode('{"type":"delta","text":"¿Está?"}\n');
    const body = new ReadableStream<Uint8Array>({
      start(c) {
        c.enqueue(bytes.slice(0, 26));
        c.enqueue(bytes.slice(26));
        c.close();
      },
    });
    expect(await all(body)).toEqual([{ type: "delta", text: "¿Está?" }]);
  });

  it("turns a malformed line into an error chunk", async () => {
    expect(await all(bodyOf("not json\n"))).toEqual([{ type: "error" }]);
    expect(await all(bodyOf('{"type":"shout","text":1}\n'))).toEqual([{ type: "error" }]);
  });
});

describe("failureFrom", () => {
  it("maps the API's error kinds", () => {
    expect(failureFrom({ error: "limited" })).toBe("limited");
    expect(failureFrom({ error: "conversation-cap" })).toBe("conversation-cap");
    expect(failureFrom({ error: "invalid", problem: "message-too-long" })).toBe("invalid");
  });

  it("treats anything unexpected as a generic failure", () => {
    expect(failureFrom({ error: "teapot" })).toBe("failed");
    expect(failureFrom(null)).toBe("failed");
  });
});

describe("chatReducer", () => {
  it("adds the question and an empty answer while it streams", () => {
    const state = chatReducer(initialChat, { type: "ask", text: "Hi" });
    expect(state.status).toBe("streaming");
    expect(state.messages.map((m) => [m.role, m.text, m.done])).toEqual([["user", "Hi", true], ["assistant", "", false]]);
  });

  it("appends deltas, lets replace swap the whole answer, and finishes", () => {
    let state = chatReducer(initialChat, { type: "ask", text: "Hi" });
    state = chatReducer(state, { type: "chunk", chunk: { type: "delta", text: "Partial" } });
    state = chatReducer(state, { type: "chunk", chunk: { type: "replace", text: "Redirect line" } });
    state = chatReducer(state, { type: "finish" });
    expect(state.messages.at(-1)).toMatchObject({ text: "Redirect line", done: true });
    expect(state.status).toBe("idle");
  });

  it("drops the unfinished exchange when the request fails", () => {
    let state = chatReducer(initialChat, { type: "ask", text: "Hi" });
    state = chatReducer(state, { type: "fail", failure: "limited" });
    expect(state.messages).toEqual([]);
    expect(state).toMatchObject({ status: "idle", failure: "limited" });
  });

  it("serves a starter instantly as a finished exchange", () => {
    const state = chatReducer(initialChat, { type: "starter", question: "Q", answer: "A" });
    expect(state.messages.map((m) => [m.role, m.text, m.done])).toEqual([["user", "Q", true], ["assistant", "A", true]]);
    expect(state.status).toBe("idle");
  });

  it("sends only finished exchanges as history", () => {
    let state = chatReducer(initialChat, { type: "starter", question: "Q", answer: "A" });
    state = chatReducer(state, { type: "ask", text: "Next" });
    expect(historyOf(state.messages)).toEqual([{ role: "user", text: "Q" }, { role: "assistant", text: "A" }]);
  });

  it("counts down the questions left and reaches the cap", () => {
    let state = initialChat;
    expect(questionsLeft(state.messages)).toBe(MAX_USER_TURNS);
    for (let i = 0; i < MAX_USER_TURNS; i++) state = chatReducer(state, { type: "starter", question: `Q${i}`, answer: "A" });
    expect(questionsLeft(state.messages)).toBe(0);
  });
});
