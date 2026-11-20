import type Anthropic from "@anthropic-ai/sdk";
import type { ModelClient, ModelEvent, ModelRequest, Screener, ScreenVerdict, StopReason, Usage } from "@/twin/ports";
import { SCREEN_SYSTEM_PROMPT, SCREEN_VERDICT_SCHEMA } from "@/twin/screen-prompt";
import type { ChatTurn } from "@/twin/types";

export const MAIN_MODEL = "claude-opus-5-5";
export const SCREEN_MODEL = "claude-haiku-5-5";
/** The screen's verdict is tiny, but thinking counts toward max_tokens. */
const SCREEN_MAX_TOKENS = 1024;
/**
 * Whole-call deadlines, retries included. Screen plus answer stays well under the
 * route's 60-second maxDuration, leaving room for the Redis calls around them.
 */
export const SCREEN_DEADLINE_MS = 12_000;
export const ANSWER_DEADLINE_MS = 35_000;
/**
 * Real text runs about 2.7 characters per token for this prompt (28.5k characters,
 * 10.5k tokens in production); assuming 1.5 keeps the cost estimate an upper bound.
 */
const MIN_CHARS_PER_TOKEN = 1.5;

interface CallOptions {
  deadlineMs?: number;
}

/** USD per million tokens. Cache writes use the 5-minute TTL rate (1.25× input). */
interface Prices {
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
}
const MAIN_PRICES: Prices = { input: 4, output: 20, cacheRead: 0.2, cacheWrite: 5 };
const SCREEN_PRICES: Prices = { input: 0.1, output: 0.5, cacheRead: 0.01, cacheWrite: 0.125 };
const TOKENS_PER_PRICE_UNIT = 1_000_000;

function priced(usage: Anthropic.Messages.Usage, prices: Prices): Usage {
  const tokens = {
    inputTokens: usage.input_tokens,
    outputTokens: usage.output_tokens,
    cacheReadTokens: usage.cache_read_input_tokens ?? 0,
    cacheWriteTokens: usage.cache_creation_input_tokens ?? 0,
  };
  const costUsd =
    (tokens.inputTokens * prices.input +
      tokens.outputTokens * prices.output +
      tokens.cacheReadTokens * prices.cacheRead +
      tokens.cacheWriteTokens * prices.cacheWrite) /
    TOKENS_PER_PRICE_UNIT;
  return { ...tokens, costUsd };
}

const KNOWN_STOPS: readonly StopReason[] = ["end_turn", "max_tokens", "refusal"];
const isKnownStop = (value: string | null): value is StopReason => KNOWN_STOPS.some((s) => s === value);
const stopReason = (value: string | null): StopReason => (isKnownStop(value) ? value : "other");

const toMessages = (turns: readonly ChatTurn[]) => turns.map((t) => ({ role: t.role, content: t.text }));

/**
 * Worst case: every input character at the costliest input rate (a cache write)
 * and the full output cap. O(number of turns).
 */
function maxCostUsd({ system, turns, maxTokens }: ModelRequest): number {
  const chars = turns.reduce((n, t) => n + t.text.length, system.length);
  const inputTokens = Math.ceil(chars / MIN_CHARS_PER_TOKEN);
  return (inputTokens * MAIN_PRICES.cacheWrite + maxTokens * MAIN_PRICES.output) / TOKENS_PER_PRICE_UNIT;
}

/** Main conversation on Opus 5.5: cached system prompt, low effort, no tools (S1, C1, A5). */
export function createModelClient(client: Anthropic, { deadlineMs = ANSWER_DEADLINE_MS }: CallOptions = {}): ModelClient {
  return {
    maxCostUsd,
    async *stream({ system, turns, maxTokens }: ModelRequest): AsyncIterable<ModelEvent> {
      const stream = client.messages.stream(
        {
          model: MAIN_MODEL,
          max_tokens: maxTokens,
          system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
          messages: toMessages(turns),
          output_config: { effort: "low" },
        },
        { signal: AbortSignal.timeout(deadlineMs) },
      );
      for await (const event of stream) {
        if (event.type === "message_start") yield { type: "started" };
        else if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
          yield { type: "text", text: event.delta.text };
        }
      }
      const final = await stream.finalMessage();
      yield { type: "end", stopReason: stopReason(final.stop_reason), usage: priced(final.usage, MAIN_PRICES) };
    },
  };
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

/** A reply that doesn't match the schema is `unreadable`: the caller fails closed but still pays for it. */
function parseVerdict(message: Anthropic.Messages.Message): ScreenVerdict {
  const text = message.content.find((block) => block.type === "text");
  if (!text || text.type !== "text") return "unreadable";
  const verdict = parseJson(text.text);
  if (typeof verdict !== "object" || verdict === null || !("allowed" in verdict) || typeof verdict.allowed !== "boolean") {
    return "unreadable";
  }
  return verdict.allowed ? "allowed" : "blocked";
}

/** Haiku 5.5 harmlessness screen with a schema-constrained verdict (S8). */
export function createScreener(client: Anthropic, { deadlineMs = SCREEN_DEADLINE_MS }: CallOptions = {}): Screener {
  return {
    async screen(turns) {
      const message = await client.messages.create(
        {
          model: SCREEN_MODEL,
          max_tokens: SCREEN_MAX_TOKENS,
          system: SCREEN_SYSTEM_PROMPT,
          // JSON-encoded so visitor text can't close the wrapper tag.
          messages: [{ role: "user", content: `<conversation>\n${JSON.stringify(turns)}\n</conversation>` }],
          output_config: { effort: "low", format: { type: "json_schema", schema: { ...SCREEN_VERDICT_SCHEMA } } },
        },
        { signal: AbortSignal.timeout(deadlineMs) },
      );
      const usage = priced(message.usage, SCREEN_PRICES);
      // A refusal from the screen itself counts as blocked.
      if (message.stop_reason === "refusal") return { verdict: "blocked", usage };
      return { verdict: parseVerdict(message), usage };
    },
  };
}
