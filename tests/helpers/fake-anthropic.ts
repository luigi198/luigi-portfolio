/**
 * Response bodies shaped like the Claude Messages API: SSE events for a
 * streamed answer, and a Message object for a non-streamed call.
 */

/** One server-sent event body: every Messages API stream event carries its `type`. */
type SseEvent = { type: string } & Record<string, unknown>;

export function sse(events: readonly SseEvent[]): Response {
  const body = events.map((e) => `event: ${e.type}\ndata: ${JSON.stringify(e)}\n\n`).join("");
  return new Response(body, { status: 200, headers: { "content-type": "text/event-stream" } });
}

export function streamedAnswer(model: string, texts: string[], stopReason: string): SseEvent[] {
  return [
    {
      type: "message_start",
      message: {
        id: "msg_1", type: "message", role: "assistant", model, content: [],
        stop_reason: null, stop_sequence: null,
        usage: { input_tokens: 20, output_tokens: 1, cache_creation_input_tokens: 0, cache_read_input_tokens: 6000 },
      },
    },
    { type: "content_block_start", index: 0, content_block: { type: "thinking", thinking: "", signature: "" } },
    { type: "content_block_delta", index: 0, delta: { type: "signature_delta", signature: "sig" } },
    { type: "content_block_stop", index: 0 },
    { type: "content_block_start", index: 1, content_block: { type: "text", text: "" } },
    ...texts.map((text) => ({ type: "content_block_delta", index: 1, delta: { type: "text_delta", text } })),
    { type: "content_block_stop", index: 1 },
    { type: "message_delta", delta: { stop_reason: stopReason, stop_sequence: null }, usage: { output_tokens: 100 } },
    { type: "message_stop" },
  ];
}

export function message(model: string, text: string, stopReason = "end_turn"): Response {
  const body = {
    id: "msg_2", type: "message", role: "assistant", model,
    content: [{ type: "text", text }], stop_reason: stopReason, stop_sequence: null,
    usage: { input_tokens: 400, output_tokens: 20, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 },
  };
  return new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } });
}
