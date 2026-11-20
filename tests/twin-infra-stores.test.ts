import { describe, expect, it } from "vitest";
import { createRedis } from "@/twin/infra/redis";
import { fakeUpstash } from "./helpers/fake-upstash";
import { COOL_OFF_SECONDS, RATE_WINDOWS, createBudgetStore, createOffenderTracker, createRateLimiter } from "@/twin/infra/stores";

const NOW = Date.UTC(2026, 10, 20, 15, 30);
const clock = (t = NOW) => ({ now: () => t });
const setup = (t = NOW) => {
  const upstash = fakeUpstash();
  const redis = createRedis({ url: "https://redis.example.test", token: "test-token", fetch: upstash.fetch });
  return { upstash, redis, clock: clock(t) };
};

describe("Upstash REST client", () => {
  it("sends commands as a pipeline with the bearer token", async () => {
    const { upstash, redis } = setup();
    expect(await redis.pipeline([["INCR", "a"], ["GET", "a"]])).toEqual([1, "1"]);
    expect(upstash.calls[0]).toMatchObject({ url: "https://redis.example.test/pipeline", auth: "Bearer test-token" });
  });

  it("throws on an HTTP error or a command error, so callers fail closed", async () => {
    const { upstash, redis } = setup();
    upstash.setDown(true);
    await expect(redis.pipeline([["GET", "a"]])).rejects.toThrow(/503/);
    const failing = createRedis({
      url: "https://redis.example.test",
      token: "t",
      fetch: async () => new Response(JSON.stringify([{ error: "WRONGTYPE" }]), { status: 200 }),
    });
    await expect(failing.pipeline([["GET", "a"]])).rejects.toThrow(/WRONGTYPE/);
  });
});

describe("rate limiter", () => {
  it("allows up to the short-window limit, then blocks", async () => {
    const { redis, clock } = setup();
    const limiter = createRateLimiter(redis, clock);
    const short = RATE_WINDOWS[0];
    for (let i = 0; i < short.max; i++) expect(await limiter.allow("v1")).toBe(true);
    expect(await limiter.allow("v1")).toBe(false);
    expect(await limiter.allow("v2")).toBe(true);
  });

  it("starts a fresh short window later, and every key expires", async () => {
    const { upstash, redis } = setup();
    const short = RATE_WINDOWS[0];
    const early = createRateLimiter(redis, clock(NOW));
    for (let i = 0; i < short.max; i++) await early.allow("v1");
    const later = createRateLimiter(redis, clock(NOW + short.seconds * 1000));
    expect(await later.allow("v1")).toBe(true);
    for (const key of upstash.data.keys()) expect(upstash.ttl.get(key)).toBeGreaterThan(0);
  });

  it("enforces the daily limit across short windows", async () => {
    const { redis } = setup();
    const [short, day] = RATE_WINDOWS;
    let allowed = 0;
    for (let w = 0; allowed < day.max + 5 && w < 20; w++) {
      const limiter = createRateLimiter(redis, clock(NOW + w * short.seconds * 1000));
      for (let i = 0; i < short.max; i++) if (await limiter.allow("v1")) allowed++;
    }
    expect(allowed).toBe(day.max);
  });
});

describe("offender tracker", () => {
  it("counts strikes per visitor and expires them after the cool-off", async () => {
    const { upstash, redis } = setup();
    const offenders = createOffenderTracker(redis);
    expect(await offenders.strikes("v1")).toBe(0);
    await offenders.addStrike("v1");
    await offenders.addStrike("v1");
    expect(await offenders.strikes("v1")).toBe(2);
    expect(await offenders.strikes("v2")).toBe(0);
    expect([...upstash.ttl.values()]).toEqual([COOL_OFF_SECONDS]);
  });
});

describe("budget store", () => {
  it("adds spend for the current UTC day only", async () => {
    const { redis } = setup();
    const today = createBudgetStore(redis, clock(NOW));
    expect(await today.spentTodayUsd()).toBe(0);
    await today.addSpendUsd(0.01);
    await today.addSpendUsd(0.0025);
    expect(await today.spentTodayUsd()).toBeCloseTo(0.0125);
    const tomorrow = createBudgetStore(redis, clock(NOW + 24 * 3600 * 1000));
    expect(await tomorrow.spentTodayUsd()).toBe(0);
  });
});
