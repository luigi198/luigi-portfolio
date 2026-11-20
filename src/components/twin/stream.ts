import type { ChatChunk } from "@/twin/types";

/** What the chat shows when a request doesn't produce an answer. */
export type ChatFailure =
  | "blocked"
  | "limited"
  | "invalid"
  | "conversation-cap"
  | "over-budget"
  | "unavailable"
  | "failed";

const API_KINDS: ReadonlySet<string> = new Set(["blocked", "limited", "invalid", "conversation-cap", "over-budget", "unavailable"]);
const isApiKind = (value: string): value is Exclude<ChatFailure, "failed"> => API_KINDS.has(value);

/** Maps the API's `{ error: kind }` body; anything else is a generic failure. */
export function failureFrom(body: unknown): ChatFailure {
  if (typeof body !== "object" || body === null || !("error" in body) || typeof body.error !== "string") return "failed";
  return isApiKind(body.error) ? body.error : "failed";
}

function toChunk(line: string): ChatChunk {
  try {
    const value: unknown = JSON.parse(line);
    if (typeof value !== "object" || value === null || !("type" in value)) return { type: "error" };
    if ((value.type === "delta" || value.type === "replace") && "text" in value && typeof value.text === "string") {
      return { type: value.type, text: value.text };
    }
  } catch {
    // Fall through: a line that isn't JSON ends the answer as an error.
  }
  return { type: "error" };
}

/** Reads the NDJSON answer stream, one chunk per line, buffering partial lines and characters. */
export async function* readChunks(body: ReadableStream<Uint8Array>): AsyncGenerator<ChatChunk> {
  const reader = body.getReader();
  // stream: true holds back a multi-byte character split across reads.
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let newline = buffer.indexOf("\n");
      while (newline !== -1) {
        const line = buffer.slice(0, newline).trim();
        buffer = buffer.slice(newline + 1);
        if (line) yield toChunk(line);
        newline = buffer.indexOf("\n");
      }
    }
    buffer += decoder.decode();
    if (buffer.trim()) yield toChunk(buffer.trim());
  } finally {
    reader.releaseLock();
  }
}
