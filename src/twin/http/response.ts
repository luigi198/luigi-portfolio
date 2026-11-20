import type { ChatChunk, TwinOutcome } from "@/twin/types";

type ErrorKind = Exclude<TwinOutcome["kind"], "answered" | "refused">;

/** HTTP status per outcome. Bodies carry only the kind; the UI picks the visitor-facing copy. */
export const STATUS_BY_KIND: Record<ErrorKind, number> = {
  blocked: 403,
  limited: 429,
  invalid: 400,
  "conversation-cap": 409,
  "over-budget": 503,
  unavailable: 503,
};

const NDJSON = "application/x-ndjson; charset=utf-8";
const encoder = new TextEncoder();

/** One JSON object per line, flushed as each chunk arrives. */
function ndjson(chunks: AsyncIterable<ChatChunk>): ReadableStream<Uint8Array> {
  const iterator = chunks[Symbol.asyncIterator]();
  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await iterator.next();
      if (done) controller.close();
      else controller.enqueue(encoder.encode(`${JSON.stringify(value)}\n`));
    },
    async cancel() {
      await iterator.return?.();
    },
  });
}

async function* single(chunk: ChatChunk) {
  yield chunk;
}

const baseHeaders = (requestId: string) => ({ "x-request-id": requestId, "cache-control": "no-store" });

export function errorResponse(kind: ErrorKind, requestId: string, extra: Record<string, string> = {}): Response {
  return Response.json({ error: kind, ...extra }, { status: STATUS_BY_KIND[kind], headers: baseHeaders(requestId) });
}

export function outcomeResponse(outcome: TwinOutcome, requestId: string): Response {
  if (outcome.kind === "answered" || outcome.kind === "refused") {
    const chunks = outcome.kind === "answered" ? outcome.chunks : single({ type: "replace", text: outcome.text });
    return new Response(ndjson(chunks), { status: 200, headers: { ...baseHeaders(requestId), "content-type": NDJSON } });
  }
  if (outcome.kind === "invalid") return errorResponse("invalid", requestId, { problem: outcome.problem });
  return errorResponse(outcome.kind, requestId);
}
