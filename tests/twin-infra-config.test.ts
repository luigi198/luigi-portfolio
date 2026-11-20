import { afterEach, describe, expect, it, vi } from "vitest";
import { ConfigError, loadTwinConfig } from "@/twin/infra/config";
import { createJsonLogger } from "@/twin/infra/logger";

const FULL = {
  ANTHROPIC_API_KEY: "test-key",
  UPSTASH_REDIS_REST_URL: "https://redis.example.test",
  UPSTASH_REDIS_REST_TOKEN: "test-token",
  VISITOR_HASH_SALT: "test-salt",
  TWIN_DAILY_BUDGET_USD: "3.5",
};

describe("loadTwinConfig", () => {
  it("reads every setting from the environment it's given", () => {
    expect(loadTwinConfig(FULL)).toEqual({
      anthropicApiKey: "test-key",
      redisUrl: "https://redis.example.test",
      redisToken: "test-token",
      visitorHashSalt: "test-salt",
      dailyBudgetUsd: 3.5,
    });
  });

  it("accepts the KV_* names some Vercel integrations inject", () => {
    const { UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN, ...rest } = FULL;
    const config = loadTwinConfig({ ...rest, KV_REST_API_URL: UPSTASH_REDIS_REST_URL, KV_REST_API_TOKEN: UPSTASH_REDIS_REST_TOKEN });
    expect(config.redisUrl).toBe(UPSTASH_REDIS_REST_URL);
  });

  it("uses a default daily budget", () => {
    const { TWIN_DAILY_BUDGET_USD, ...rest } = FULL;
    void TWIN_DAILY_BUDGET_USD;
    expect(loadTwinConfig(rest).dailyBudgetUsd).toBe(5);
  });

  it("names every missing variable, without printing any value", () => {
    const attempt = () => loadTwinConfig({ ANTHROPIC_API_KEY: "test-key" });
    expect(attempt).toThrow(ConfigError);
    expect(attempt).toThrow(/UPSTASH_REDIS_REST_URL.*UPSTASH_REDIS_REST_TOKEN.*VISITOR_HASH_SALT/);
    expect(attempt).not.toThrow(/test-key/);
  });

  it("rejects a budget that isn't a positive number", () => {
    expect(() => loadTwinConfig({ ...FULL, TWIN_DAILY_BUDGET_USD: "lots" })).toThrow(ConfigError);
    expect(() => loadTwinConfig({ ...FULL, TWIN_DAILY_BUDGET_USD: "0" })).toThrow(ConfigError);
  });
});

describe("JSON logger", () => {
  afterEach(() => vi.restoreAllMocks());

  it("writes one JSON line per event with level, event and fields", () => {
    const out = vi.spyOn(console, "log").mockImplementation(() => {});
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    const logger = createJsonLogger({ now: () => 0 });
    logger.info("twin.answered", { requestId: "r1", costUsd: 0.01 });
    logger.error("twin.unavailable", { requestId: "r2", errorClass: "Error" });
    expect(JSON.parse(String(out.mock.calls[0][0]))).toEqual({
      level: "info", event: "twin.answered", time: "1970-01-01T00:00:00.000Z", requestId: "r1", costUsd: 0.01,
    });
    expect(JSON.parse(String(err.mock.calls[0][0]))).toMatchObject({ level: "error", event: "twin.unavailable" });
  });
});
