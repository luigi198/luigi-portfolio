import Anthropic from "@anthropic-ai/sdk";
import type { Clock } from "@/twin/ports";
import type { TwinDeps } from "@/twin/service";
import { createModelClient, createScreener } from "@/twin/infra/anthropic";
import { createBotVerifier } from "@/twin/infra/bot-check";
import type { TwinConfig } from "@/twin/infra/config";
import { createJsonLogger } from "@/twin/infra/logger";
import { createRedis } from "@/twin/infra/redis";
import { createBudgetStore, createOffenderTracker, createRateLimiter } from "@/twin/infra/stores";

/** One retry for transient API errors; past that the visitor sees the error chunk. */
const ANTHROPIC_MAX_RETRIES = 1;

const systemClock: Clock = { now: () => Date.now() };

/** Wires the real adapters. Called on first request, never at import (research P4). */
export function createTwinDeps(config: TwinConfig): TwinDeps {
  const anthropic = new Anthropic({
    apiKey: config.anthropicApiKey,
    // Each call also carries a whole-call deadline, retries included (see infra/anthropic.ts).
    maxRetries: ANTHROPIC_MAX_RETRIES,
  });
  const redis = createRedis({ url: config.redisUrl, token: config.redisToken });
  return {
    bot: createBotVerifier(),
    rateLimiter: createRateLimiter(redis, systemClock),
    offenders: createOffenderTracker(redis),
    budget: createBudgetStore(redis, systemClock),
    screener: createScreener(anthropic),
    model: createModelClient(anthropic),
    logger: createJsonLogger(systemClock),
    clock: systemClock,
    dailyBudgetUsd: config.dailyBudgetUsd,
  };
}
