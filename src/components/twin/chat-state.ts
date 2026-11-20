import { MAX_USER_TURNS } from "@/twin/policy";
import type { ChatChunk, ChatTurn } from "@/twin/types";
import type { ChatFailure } from "./stream";

export interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  text: string;
  /** False while the answer is still streaming. */
  done: boolean;
}

export interface ChatState {
  messages: ChatMessage[];
  status: "idle" | "streaming";
  failure: ChatFailure | null;
  nextId: number;
}

export type ChatAction =
  | { type: "ask"; text: string }
  | { type: "starter"; question: string; answer: string }
  | { type: "chunk"; chunk: Exclude<ChatChunk, { type: "error" }> }
  | { type: "finish" }
  | { type: "fail"; failure: ChatFailure };

export const initialChat: ChatState = { messages: [], status: "idle", failure: null, nextId: 0 };

function exchange(state: ChatState, question: string, answer: string, done: boolean): ChatState {
  const id = state.nextId;
  return {
    ...state,
    nextId: id + 2,
    failure: null,
    status: done ? "idle" : "streaming",
    messages: [
      ...state.messages,
      { id, role: "user", text: question, done: true },
      { id: id + 1, role: "assistant", text: answer, done },
    ],
  };
}

function updateLast(state: ChatState, update: (m: ChatMessage) => ChatMessage): ChatState {
  const last = state.messages.at(-1);
  if (!last || last.role !== "assistant") return state;
  return { ...state, messages: [...state.messages.slice(0, -1), update(last)] };
}

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "ask":
      return exchange(state, action.text, "", false);
    case "starter":
      return exchange(state, action.question, action.answer, true);
    case "chunk":
      return updateLast(state, (m) => ({ ...m, text: action.chunk.type === "delta" ? m.text + action.chunk.text : action.chunk.text }));
    case "finish":
      return { ...updateLast(state, (m) => ({ ...m, done: true })), status: "idle" };
    case "fail": {
      // Drop the unfinished exchange so history stays a clean user/assistant alternation.
      const last = state.messages.at(-1);
      const messages = last && !last.done ? state.messages.slice(0, -2) : state.messages;
      return { ...state, messages, status: "idle", failure: action.failure };
    }
  }
}

/** Complete question-and-answer pairs only, in the shape the API expects. O(n). */
export function historyOf(messages: readonly ChatMessage[]): ChatTurn[] {
  const turns: ChatTurn[] = [];
  for (let i = 0; i + 1 < messages.length; i += 2) {
    const [question, answer] = [messages[i], messages[i + 1]];
    if (!answer.done || !answer.text.trim()) continue;
    turns.push({ role: "user", text: question.text }, { role: "assistant", text: answer.text });
  }
  return turns;
}

export function questionsLeft(messages: readonly ChatMessage[]): number {
  return Math.max(0, MAX_USER_TURNS - messages.filter((m) => m.role === "user").length);
}
