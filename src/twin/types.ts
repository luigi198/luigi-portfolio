import type { Locale } from "@/i18n/config";

/** Boundary types between the twin's content, its domain logic and the API route. */

export interface QuestionAnswer {
  question: string;
  answer: string;
}

/** One answer in Luis's own words, in every locale. Few-shot example for the model. */
export interface TwinExample {
  id: string;
  text: Record<Locale, QuestionAnswer>;
}

/** Fixed lines the twin uses instead of improvising. */
export interface TwinReplies {
  /** Off-topic, abusive or instruction-override messages, and model refusals. */
  redirect: Record<Locale, string>;
}

export interface ChatTurn {
  role: "user" | "assistant";
  text: string;
}

/** One visitor message, after the route has parsed the HTTP body. */
export interface TwinRequest {
  requestId: string;
  /** Hashed IP: never the raw address (research P1). */
  visitorId: string;
  locale: Locale;
  /** Earlier turns, as sent by the browser. Untrusted until validated. */
  history: readonly ChatTurn[];
  message: string;
}

/** What streams back to the visitor. `replace` swaps everything shown so far. */
export type ChatChunk =
  | { type: "delta"; text: string }
  | { type: "replace"; text: string }
  | { type: "error" };

export type ConversationProblem = "empty-message" | "message-too-long" | "invalid-history";

/** Every way a request can end. The route maps each one to a visitor-safe response. */
export type TwinOutcome =
  | { kind: "answered"; chunks: AsyncIterable<ChatChunk> }
  | { kind: "refused"; text: string }
  | { kind: "blocked" }
  | { kind: "limited" }
  | { kind: "invalid"; problem: ConversationProblem }
  | { kind: "conversation-cap" }
  | { kind: "over-budget" }
  | { kind: "unavailable" };
