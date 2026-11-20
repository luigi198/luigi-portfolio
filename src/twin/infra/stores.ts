import type { BudgetStore, Clock, OffenderTracker, RateLimiter } from "@/twin/ports";
import type { Redis } from "@/twin/infra/redis";

/** Messages per visitor per fixed window (research A2): 10 per 10 minutes, 30 per day. */
export const RATE_WINDOWS = [
  { name: "10m", seconds: 600, max: 10 },
  { name: "day", seconds: 86_400, max: 30 },
] as const;
/** How long strikes last; each new strike restarts it (S10). */
export const COOL_OFF_SECONDS = 3600;
/** Spend keys outlive their day so a late write never lands on an expired key. */
const BUDGET_KEY_TTL_SECONDS = 2 * 86_400;
const PREFIX = "twin";

const toNumber = (value: unknown) => (value === null ? 0 : Number(value));

/** Fixed-window counters: one INCR and EXPIRE per window, in one round trip. */
export function createRateLimiter(redis: Redis, clock: Clock): RateLimiter {
  return {
    async allow(visitorId) {
      const nowSeconds = Math.floor(clock.now() / 1000);
      const keys = RATE_WINDOWS.map((w) => `${PREFIX}:rate:${w.name}:${visitorId}:${Math.floor(nowSeconds / w.seconds)}`);
      const results = await redis.pipeline(RATE_WINDOWS.flatMap((w, i) => [["INCR", keys[i]], ["EXPIRE", keys[i], w.seconds]]));
      return RATE_WINDOWS.every((w, i) => toNumber(results[i * 2]) <= w.max);
    },
  };
}

export function createOffenderTracker(redis: Redis): OffenderTracker {
  const key = (visitorId: string) => `${PREFIX}:strikes:${visitorId}`;
  return {
    async strikes(visitorId) {
      const [value] = await redis.pipeline([["GET", key(visitorId)]]);
      return toNumber(value);
    },
    async addStrike(visitorId) {
      await redis.pipeline([["INCR", key(visitorId)], ["EXPIRE", key(visitorId), COOL_OFF_SECONDS]]);
    },
  };
}

/** Spend across all visitors for the current UTC day (A6). */
export function createBudgetStore(redis: Redis, clock: Clock): BudgetStore {
  const key = () => `${PREFIX}:spend:${new Date(clock.now()).toISOString().slice(0, 10)}`;
  return {
    async spentTodayUsd() {
      const [value] = await redis.pipeline([["GET", key()]]);
      return toNumber(value);
    },
    async addSpendUsd(amount) {
      const k = key();
      await redis.pipeline([["INCRBYFLOAT", k, amount], ["EXPIRE", k, BUDGET_KEY_TTL_SECONDS]]);
    },
  };
}
