import type { ChatTurn, ConversationProblem } from "@/twin/types";

/** Longest visitor message, after trimming (research A3). */
export const MAX_MESSAGE_CHARS = 500;
/** Visitor messages per conversation before handing off to booking (A4). */
export const MAX_USER_TURNS = 10;
/** Longest earlier answer accepted back from the browser; well above what MAX_OUTPUT_TOKENS can produce. */
export const MAX_ASSISTANT_CHARS = 6000;
/** Output cap for the main model; thinking counts toward it (A5). */
export const MAX_OUTPUT_TOKENS = 1000;

const ROLE_AT_EVEN_INDEX = "user";

export type ConversationCheck =
  | { ok: true; turns: ChatTurn[] }
  | { ok: false; problem: ConversationProblem | "turn-cap" };

const lengthLimit = (turn: ChatTurn) => (turn.role === "user" ? MAX_MESSAGE_CHARS : MAX_ASSISTANT_CHARS);

/** History must alternate user, assistant, end on an answer, and respect every length cap. O(n). */
function isValidHistory(history: readonly ChatTurn[]): boolean {
  if (history.length % 2 !== 0) return false;
  return history.every((turn, i) => {
    const expected = i % 2 === 0 ? ROLE_AT_EVEN_INDEX : "assistant";
    const text = turn.text.trim();
    return turn.role === expected && text.length > 0 && text.length <= lengthLimit(turn);
  });
}

/** Validates the browser's history plus the new message; returns the turns to send on. */
export function checkConversation(history: readonly ChatTurn[], message: string): ConversationCheck {
  const text = message.trim();
  if (text.length === 0) return { ok: false, problem: "empty-message" };
  if (text.length > MAX_MESSAGE_CHARS) return { ok: false, problem: "message-too-long" };
  if (!isValidHistory(history)) return { ok: false, problem: "invalid-history" };
  if (history.length / 2 >= MAX_USER_TURNS) return { ok: false, problem: "turn-cap" };
  return { ok: true, turns: [...history, { role: "user", text }] };
}
