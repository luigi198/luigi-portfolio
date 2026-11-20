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
  OffenderTracker,
  RateLimiter,
  Screener,
} from "@/twin/ports";
import type { ChatChunk, ChatTurn, TwinOutcome, TwinRequest } from "@/twin/types";

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

type Admission = { turns: ChatTurn[] } | Exclude<TwinOutcome, { kind: "answered" | "refused" }>;
type EndEvent = Extract<ModelEvent, { type: "end" }>;

const SYSTEM_PROMPT = buildSystemPrompt();

const errorClass = (err: unknown) => (err instanceof Error ? err.constructor.name : typeof err);

/** Cheapest checks first, so abuse costs nothing (research A8: any failure here fails closed). */
async function admit(deps: TwinDeps, req: TwinRequest): Promise<Admission> {
  if (await deps.bot.isBot()) return { kind: "blocked" };
  if ((await deps.offenders.strikes(req.visitorId)) >= MAX_STRIKES) return { kind: "limited" };
  if (!(await deps.rateLimiter.allow(req.visitorId))) return { kind: "limited" };
  const check = checkConversation(req.history, req.message);
  if (!check.ok) return check.problem === "turn-cap" ? { kind: "conversation-cap" } : { kind: "invalid", problem: check.problem };
  if ((await deps.budget.spentTodayUsd()) >= deps.dailyBudgetUsd) return { kind: "over-budget" };
  return { turns: check.turns };
}

/** Runs the gate and the screen; hands back a stream only for allowed messages. */
async function handle(deps: TwinDeps, req: TwinRequest): Promise<TwinOutcome> {
  const started = deps.clock.now();
  const meta: LogFields = { requestId: req.requestId, visitorId: req.visitorId, locale: req.locale };
  try {
    const admission = await admit(deps, req);
    if (!("turns" in admission)) {
      const detail = admission.kind === "invalid" ? { problem: admission.problem } : {};
      deps.logger.info(`twin.${admission.kind}`, { ...meta, ...detail });
      return admission;
    }
    const screen = await deps.screener.screen(admission.turns);
    await deps.budget.addSpendUsd(screen.usage.costUsd);
    if (!screen.allowed) {
      await deps.offenders.addStrike(req.visitorId);
      deps.logger.warn("twin.screened_out", { ...meta, screenCostUsd: screen.usage.costUsd });
      return { kind: "refused", text: REPLIES.redirect[req.locale] };
    }
    return { kind: "answered", chunks: answer(deps, req, admission.turns, { ...meta, started }) };
  } catch (err) {
    deps.logger.error("twin.unavailable", { ...meta, errorClass: errorClass(err), latencyMs: deps.clock.now() - started });
    return { kind: "unavailable" };
  }
}

/** Streams the model's text, then settles cost, strikes and logs once the answer ends. */
async function* answer(
  deps: TwinDeps,
  req: TwinRequest,
  turns: ChatTurn[],
  meta: LogFields & { started: number },
): AsyncGenerator<ChatChunk> {
  const { started, ...fields } = meta;
  let end: EndEvent | undefined;
  try {
    for await (const event of deps.model.stream({ system: SYSTEM_PROMPT, turns, maxTokens: MAX_OUTPUT_TOKENS })) {
      if (event.type === "text") yield { type: "delta", text: event.text };
      else end = event;
    }
    if (!end) throw new Error("Model stream ended without a final event");
  } catch (err) {
    deps.logger.error("twin.model_failed", { ...fields, errorClass: errorClass(err), latencyMs: deps.clock.now() - started });
    yield { type: "error" };
    return;
  }

  if (end.stopReason === "refusal") yield { type: "replace", text: REPLIES.redirect[req.locale] };
  await settle(deps, req, end, fields);
  const { usage } = end;
  deps.logger.info("twin.answered", {
    ...fields,
    stopReason: end.stopReason,
    inputTokens: usage.inputTokens,
    outputTokens: usage.outputTokens,
    cacheReadTokens: usage.cacheReadTokens,
    cacheWriteTokens: usage.cacheWriteTokens,
    costUsd: usage.costUsd,
    latencyMs: deps.clock.now() - started,
  });
}

/** Records spend and refusal strikes. The answer is already shown, so a store failure is logged, not surfaced. */
async function settle(deps: TwinDeps, req: TwinRequest, end: EndEvent, fields: LogFields): Promise<void> {
  try {
    await deps.budget.addSpendUsd(end.usage.costUsd);
    if (end.stopReason === "refusal") await deps.offenders.addStrike(req.visitorId);
  } catch (err) {
    deps.logger.error("twin.settle_failed", { ...fields, errorClass: errorClass(err) });
  }
}

export function createTwinService(deps: TwinDeps) {
  return { handle: (req: TwinRequest) => handle(deps, req) };
}
