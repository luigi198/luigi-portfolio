import Anthropic from "@anthropic-ai/sdk";
import { mkdirSync, writeFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { createModelClient, createScreener } from "@/twin/infra/anthropic";
import type { LogFields } from "@/twin/ports";
import { createTwinService } from "@/twin/service";
import type { TwinOutcome } from "@/twin/types";
import { EVAL_CASES } from "./cases";
import { checkResult, type CheckFailure, type EvalCase, type EvalResult } from "./checks";

/**
 * Runs the eval set against the real Claude API (research E3). Costs money, so it
 * only runs through `npm run eval:twin`, with TWIN_EVAL=1 and a real key. Stores
 * and the bot check are in memory: this measures the prompt and models, not Redis.
 */

/** Hard stop for one run; a full run costs well under this. */
const RUN_BUDGET_USD = 2;
const REPORT_DIR = "private/eval-results";

interface Row {
  c: EvalCase;
  result: EvalResult;
  failures: CheckFailure[];
}

function requireOptIn(): string {
  const key = process.env.ANTHROPIC_API_KEY;
  if (process.env.TWIN_EVAL !== "1" || !key) {
    throw new Error("The eval calls the paid API. Run it with `npm run eval:twin` and ANTHROPIC_API_KEY in .env.local.");
  }
  return key;
}

async function run(service: ReturnType<typeof createTwinService>, c: EvalCase): Promise<EvalResult> {
  const outcome: TwinOutcome = await service.handle({
    requestId: `eval-${c.id}`,
    visitorId: "eval",
    locale: c.locale,
    history: c.history ?? [],
    message: c.message,
  });
  if (outcome.kind === "refused") return { outcome: "refused", text: outcome.text };
  if (outcome.kind !== "answered") return { outcome: outcome.kind, text: "" };
  let text = "";
  for await (const chunk of outcome.chunks) {
    if (chunk.type === "error") return { outcome: "unavailable", text };
    text = chunk.type === "delta" ? text + chunk.text : chunk.text;
  }
  return { outcome: "answered", text };
}

function report(rows: Row[], spentUsd: number, cacheReadTokens: number): string {
  const passed = rows.filter((r) => r.failures.length === 0).length;
  const lines = [
    `# AI twin eval: ${passed}/${rows.length} passed the automatic checks`,
    "",
    `Cost: $${spentUsd.toFixed(4)}. Cache-read tokens: ${cacheReadTokens}.`,
    "Automatic checks catch rule breaks. Read every answer against its \"Expect\" line for voice and grounding.",
    "",
  ];
  for (const { c, result, failures } of rows) {
    lines.push(
      `## ${failures.length === 0 ? "PASS" : "FAIL"} · ${c.id} (${c.category}, ${c.locale})`,
      "",
      `**Visitor:** ${c.message}`,
      "",
      `**Expect:** ${c.expect}`,
      "",
      `**Outcome:** ${result.outcome}`,
      "",
      `> ${result.text.replace(/\n/g, "\n> ") || "(no text)"}`,
      "",
      ...(failures.length ? [`**Failed checks:** ${failures.map((f) => `${f.check} (${f.detail})`).join(", ")}`, ""] : []),
    );
  }
  return lines.join("\n");
}

describe("AI twin eval (paid)", () => {
  it("passes every automatic check", async () => {
    const anthropic = new Anthropic({ apiKey: requireOptIn(), maxRetries: 2 });
    let spent = 0;
    let cacheReadTokens = 0;
    const record = (event: string, fields: LogFields) => {
      if (event === "twin.answered" && typeof fields.cacheReadTokens === "number") cacheReadTokens += fields.cacheReadTokens;
      if (event.includes("failed") || event === "twin.unavailable") console.error(event, fields);
    };
    const service = createTwinService({
      bot: { isBot: async () => false },
      rateLimiter: { allow: async () => true },
      offenders: { strikes: async () => 0, addStrike: async () => {} },
      budget: { spentTodayUsd: async () => spent, addSpendUsd: async (n) => void (spent += n) },
      screener: createScreener(anthropic),
      model: createModelClient(anthropic),
      logger: { info: record, warn: record, error: record },
      clock: { now: () => Date.now() },
      dailyBudgetUsd: RUN_BUDGET_USD,
    });

    // Sequential, so every case after the first reads the cached prompt.
    const rows: Row[] = [];
    for (const c of EVAL_CASES) {
      const result = await run(service, c);
      rows.push({ c, result, failures: checkResult(c, result) });
    }

    mkdirSync(REPORT_DIR, { recursive: true });
    const path = `${REPORT_DIR}/twin-${new Date().toISOString().replace(/[:.]/g, "-")}.md`;
    writeFileSync(path, report(rows, spent, cacheReadTokens));
    console.log(`Report: ${path} · cost $${spent.toFixed(4)}`);
    expect(rows.filter((r) => r.failures.length > 0).map((r) => r.c.id)).toEqual([]);
  });
});
