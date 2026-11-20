import type Anthropic from "@anthropic-ai/sdk";
import type { ModelClient, ModelEvent, ModelRequest, Screener, StopReason, Usage } from "@/twin/ports";
import { SCREEN_SYSTEM_PROMPT, SCREEN_VERDICT_SCHEMA } from "@/twin/screen-prompt";
import type { ChatTurn } from "@/twin/types";

export const MAIN_MODEL = "claude-opus-5-5";
export const SCREEN_MODEL = "claude-haiku-5-5";
/** The screen's verdict is tiny, but thinking counts toward max_tokens. */
const SCREEN_MAX_TOKENS = 1024;

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

/** Main conversation on Opus 5.5: cached system prompt, low effort, no tools (S1, C1, A5). */
export function createModelClient(client: Anthropic): ModelClient {
  return {
    async *stream({ system, turns, maxTokens }: ModelRequest): AsyncIterable<ModelEvent> {
      const stream = client.messages.stream({
        model: MAIN_MODEL,
        max_tokens: maxTokens,
        system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
        messages: toMessages(turns),
        output_config: { effort: "low" },
      });
      for await (const event of stream) {
        if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
          yield { type: "text", text: event.delta.text };
        }
      }
      const final = await stream.finalMessage();
      yield { type: "end", stopReason: stopReason(final.stop_reason), usage: priced(final.usage, MAIN_PRICES) };
    },
  };
}

function parseVerdict(message: Anthropic.Messages.Message): boolean {
  const text = message.content.find((block) => block.type === "text");
  if (!text || text.type !== "text") throw new Error("Screen returned no text block");
  const verdict: unknown = JSON.parse(text.text);
  if (typeof verdict !== "object" || verdict === null || !("allowed" in verdict) || typeof verdict.allowed !== "boolean") {
    throw new Error("Screen verdict did not match its schema");
  }
  return verdict.allowed;
}

/** Haiku 5.5 harmlessness screen with a schema-constrained verdict (S8). */
export function createScreener(client: Anthropic): Screener {
  return {
    async screen(turns) {
      const message = await client.messages.create({
        model: SCREEN_MODEL,
        max_tokens: SCREEN_MAX_TOKENS,
        system: SCREEN_SYSTEM_PROMPT,
        // JSON-encoded so visitor text can't close the wrapper tag.
        messages: [{ role: "user", content: `<conversation>\n${JSON.stringify(turns)}\n</conversation>` }],
        output_config: { effort: "low", format: { type: "json_schema", schema: { ...SCREEN_VERDICT_SCHEMA } } },
      });
      const usage = priced(message.usage, SCREEN_PRICES);
      // A refusal from the screen itself counts as blocked.
      if (message.stop_reason === "refusal") return { allowed: false, usage };
      return { allowed: parseVerdict(message), usage };
    },
  };
}
