/** Server-only settings for the twin, read when first needed, never at import (research P4). */

export interface TwinConfig {
  anthropicApiKey: string;
  redisUrl: string;
  redisToken: string;
  /** Salt for hashing visitor IPs, so logs and keys never hold a raw address (P1). */
  visitorHashSalt: string;
  dailyBudgetUsd: number;
}

export class ConfigError extends Error {
  override name = "ConfigError";
}

const DEFAULT_DAILY_BUDGET_USD = 5;

type Env = Record<string, string | undefined>;

/** First non-empty value among the given names (Vercel integrations differ in naming). */
const pick = (env: Env, ...names: string[]) => names.map((n) => env[n]?.trim()).find((v) => v);

export function loadTwinConfig(env: Env = process.env): TwinConfig {
  const missing: string[] = [];
  /** The value under the first name that has one; records the primary name when none do. */
  const required = (...names: string[]) => {
    const value = pick(env, ...names);
    if (!value) missing.push(names[0]);
    return value ?? "";
  };
  const anthropicApiKey = required("ANTHROPIC_API_KEY");
  const redisUrl = required("UPSTASH_REDIS_REST_URL", "KV_REST_API_URL");
  const redisToken = required("UPSTASH_REDIS_REST_TOKEN", "KV_REST_API_TOKEN");
  const visitorHashSalt = required("VISITOR_HASH_SALT");
  if (missing.length > 0) throw new ConfigError(`Missing environment variables: ${missing.join(", ")}`);

  const budgetRaw = pick(env, "TWIN_DAILY_BUDGET_USD");
  const dailyBudgetUsd = budgetRaw === undefined ? DEFAULT_DAILY_BUDGET_USD : Number(budgetRaw);
  if (!Number.isFinite(dailyBudgetUsd) || dailyBudgetUsd <= 0) {
    throw new ConfigError("TWIN_DAILY_BUDGET_USD must be a positive number");
  }
  return { anthropicApiKey, redisUrl, redisToken, visitorHashSalt, dailyBudgetUsd };
}
