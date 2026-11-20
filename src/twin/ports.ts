import type { ChatTurn } from "@/twin/types";

/**
 * Interfaces the twin's domain depends on. Infrastructure (src/twin/infra)
 * implements them; tests use small in-memory versions.
 */

export interface Usage {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  /** Priced by the adapter, which knows the model's rates. */
  costUsd: number;
}

export type StopReason = "end_turn" | "max_tokens" | "refusal" | "other";

export interface ModelRequest {
  system: string;
  /** Validated conversation, ending with the visitor's new message. */
  turns: readonly ChatTurn[];
  maxTokens: number;
}

export type ModelEvent =
  | { type: "text"; text: string }
  | { type: "end"; stopReason: StopReason; usage: Usage };

/** The main conversation model (research C1, A5, S11). */
export interface ModelClient {
  stream(request: ModelRequest): AsyncIterable<ModelEvent>;
}

/** The small-model harmlessness screen. A screen refusal must come back as `allowed: false` (S8). */
export interface Screener {
  screen(turns: readonly ChatTurn[]): Promise<{ allowed: boolean; usage: Usage }>;
}

/** Bot check for the current request (A1). */
export interface BotVerifier {
  isBot(): Promise<boolean>;
}

/** Per-visitor message limits over sliding windows (A2). */
export interface RateLimiter {
  allow(visitorId: string): Promise<boolean>;
}

/** Blocked-message strikes per visitor; strikes expire after a cooling-off period (S10). */
export interface OffenderTracker {
  strikes(visitorId: string): Promise<number>;
  addStrike(visitorId: string): Promise<void>;
}

/** Spend for the current day, across all visitors (A6). */
export interface BudgetStore {
  spentTodayUsd(): Promise<number>;
  addSpendUsd(amount: number): Promise<void>;
}

export type LogFields = Record<string, string | number | boolean | undefined>;

/** Structured logs. Callers pass metadata only, never visitor text (P1). */
export interface Logger {
  info(event: string, fields: LogFields): void;
  warn(event: string, fields: LogFields): void;
  error(event: string, fields: LogFields): void;
}

export interface Clock {
  now(): number;
}
