import { REPLIES } from "@/content/twin/replies";
import { MAX_OUTPUT_TOKENS, checkConversation } from "@/twin/policy";
import { buildSystemPrompt } from "@/twin/prompt";
import type {
  BotVerifier,
  BudgetStore,
  Clock,
  LogFields,
  Logger,
  ModelClient,
  ModelEvent,
  ModelRequest,
  OffenderTracker,
  RateLimiter,
  Screener,
} from "@/twin/ports";
import type { ChatChunk, TwinOutcome, TwinRequest } from "@/twin/types";

/** Blocked messages before a visitor is cooled off (research S10). */
export const MAX_STRIKES = 3;

export interface TwinDeps {
  bot: BotVerifier;
  rateLimiter: RateLimiter;
  offenders: OffenderTracker;
  budget: BudgetStore;
  screener: Screener;
  model: ModelClient;
  logger: Logger;
  clock: Clock;
  dailyBudgetUsd: number;
}

interface Admitted {
  request: ModelRequest;
  /** Worst-case model cost, already added to today's spend. */
  reservedUsd: number;
}
type Admission = Admitted | Exclude<TwinOutcome, { kind: "answered" | "refused" }>;
type EndEvent = Extract<ModelEvent, { type: "end" }>;

const SYSTEM_PROMPT = buildSystemPrompt();

const errorClass = (err: unknown) => (err instanceof Error ? err.constructor.name : typeof err);

/**
 * Cheapest checks first, so abuse costs nothing (research A8: any failure here fails closed).
 * The budget check reserves the model's worst case, so concurrent requests can't overshoot it.
 */
async function admit(deps: TwinDeps, req: TwinRequest): Promise<Admission> {
  if (await deps.bot.isBot()) return { kind: "blocked" };
  if ((await deps.offenders.strikes(req.visitorId)) >= MAX_STRIKES) return { kind: "limited" };
  if (!(await deps.rateLimiter.allow(req.visitorId))) return { kind: "limited" };
  const check = checkConversation(req.history, req.message);
  if (!check.ok) return check.problem === "turn-cap" ? { kind: "conversation-cap" } : { kind: "invalid", problem: check.problem };
  const request: ModelRequest = { system: SYSTEM_PROMPT, turns: check.turns, maxTokens: MAX_OUTPUT_TOKENS };
  const reservedUsd = deps.model.maxCostUsd(request);
  if (!(await deps.budget.reserve(reservedUsd, deps.dailyBudgetUsd))) return { kind: "over-budget" };
  return { request, reservedUsd };
}

/** Runs the screen; on anything but `allowed` the reservation goes back, since the model never runs. */
async function screen(deps: TwinDeps, { request, reservedUsd }: Admitted) {
  let result;
  try {
    result = await deps.screener.screen(request.turns);
  } catch (err) {
    await deps.budget.addSpendUsd(-reservedUsd);
    throw err;
  }
  const refund = result.verdict === "allowed" ? 0 : reservedUsd;
  await deps.budget.addSpendUsd(result.usage.costUsd - refund);
  return result;
}

/** Runs the gate and the screen; hands back a stream only for allowed messages. */
async function handle(deps: TwinDeps, req: TwinRequest): Promise<TwinOutcome> {
  const started = deps.clock.now();
  const meta: LogFields = { requestId: req.requestId, visitorId: req.visitorId, locale: req.locale };
  try {
    const admission = await admit(deps, req);
    if (!("request" in admission)) {
      const detail = admission.kind === "invalid" ? { problem: admission.problem } : {};
      deps.logger.info(`twin.${admission.kind}`, { ...meta, ...detail });
      return admission;
    }
    const { verdict, usage } = await screen(deps, admission);
    if (verdict === "unreadable") throw new Error("Screen verdict did not match its schema");
    if (verdict === "blocked") {
      await deps.offenders.addStrike(req.visitorId);
      deps.logger.warn("twin.screened_out", { ...meta, screenCostUsd: usage.costUsd });
      return { kind: "refused", text: REPLIES.redirect[req.locale] };
    }
    return { kind: "answered", chunks: answer(deps, req, admission, { ...meta, started }) };
  } catch (err) {
    deps.logger.error("twin.unavailable", { ...meta, errorClass: errorClass(err), latencyMs: deps.clock.now() - started });
    return { kind: "unavailable" };
  }
}

/** What the stream got to before it ended, failed or was cancelled. */
interface Progress {
  started: boolean;
  sawText: boolean;
  end?: EndEvent;
}

/**
 * Streams the model's text. Spend is settled in `finally`, so it also runs when the
 * visitor disconnects mid-answer (the response stream calls `return()` on this generator).
 */
async function* answer(deps: TwinDeps, req: TwinRequest, admitted: Admitted, meta: LogFields & { started: number }): AsyncGenerator<ChatChunk> {
  const { started, ...fields } = meta;
  const progress: Progress = { started: false, sawText: false };
  try {
    try {
      for await (const event of deps.model.stream(admitted.request)) {
        if (event.type === "started") progress.started = true;
        else if (event.type === "text") {
          progress.sawText = true;
          yield { type: "delta", text: event.text };
        } else progress.end = event;
      }
      if (!progress.end) throw new Error("Model stream ended without a final event");
    } catch (err) {
      deps.logger.error("twin.model_failed", { ...fields, errorClass: errorClass(err), latencyMs: deps.clock.now() - started });
      yield { type: "error" };
      return;
    }
    if (progress.end.stopReason === "refusal") yield { type: "replace", text: REPLIES.redirect[req.locale] };
    else if (!progress.sawText) {
      deps.logger.warn("twin.empty_answer", { ...fields, stopReason: progress.end.stopReason });
      yield { type: "error" };
    }
  } finally {
    await settle(deps, req, admitted.reservedUsd, progress, { ...fields, latencyMs: deps.clock.now() - started });
  }
}

/**
 * Turns the reservation into the real cost, and records refusal strikes. Without a final
 * event the real cost is unknown: the reservation is kept if the model had started (it may
 * have billed) and given back if it hadn't. The answer is already shown, so a store
 * failure is logged, not surfaced.
 */
async function settle(deps: TwinDeps, req: TwinRequest, reservedUsd: number, progress: Progress, fields: LogFields): Promise<void> {
  const { end } = progress;
  try {
    if (!end) {
      if (progress.started) deps.logger.warn("twin.cut_off", { ...fields, reservedUsd });
      else await deps.budget.addSpendUsd(-reservedUsd);
      return;
    }
    await deps.budget.addSpendUsd(end.usage.costUsd - reservedUsd);
    if (end.stopReason === "refusal") await deps.offenders.addStrike(req.visitorId);
    const { usage } = end;
    deps.logger.info("twin.answered", {
      ...fields,
      stopReason: end.stopReason,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      cacheReadTokens: usage.cacheReadTokens,
      cacheWriteTokens: usage.cacheWriteTokens,
      costUsd: usage.costUsd,
    });
  } catch (err) {
    deps.logger.error("twin.settle_failed", { ...fields, errorClass: errorClass(err) });
  }
}

export function createTwinService(deps: TwinDeps) {
  return { handle: (req: TwinRequest) => handle(deps, req) };
}
