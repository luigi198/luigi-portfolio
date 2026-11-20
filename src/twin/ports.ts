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

/**
 * `started` means the provider accepted the request, so it may bill from here on;
 * an error before it means the request was rejected and cost nothing.
 */
export type ModelEvent =
  | { type: "started" }
  | { type: "text"; text: string }
  | { type: "end"; stopReason: StopReason; usage: Usage };

/** The main conversation model (research C1, A5, S11). */
export interface ModelClient {
  stream(request: ModelRequest): AsyncIterable<ModelEvent>;
  /** An upper bound on what the request can cost, reserved from the budget before it runs. */
  maxCostUsd(request: ModelRequest): number;
}

/** `unreadable` is a reply that didn't match the verdict schema: neither allowed nor the visitor's fault. */
export type ScreenVerdict = "allowed" | "blocked" | "unreadable";

/** The small-model harmlessness screen. A screen refusal must come back as `blocked` (S8). */
export interface Screener {
  screen(turns: readonly ChatTurn[]): Promise<{ verdict: ScreenVerdict; usage: Usage }>;
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
  /**
   * Atomically adds `amountUsd` if today's spend before it was under `limitUsd`;
   * otherwise records nothing and returns false. Concurrent requests can't all slip under.
   */
  reserve(amountUsd: number, limitUsd: number): Promise<boolean>;
  /** Adds to today's spend; a negative amount gives back an unused reservation. */
  addSpendUsd(amountUsd: number): Promise<void>;
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
