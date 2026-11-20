import { beforeEach, describe, expect, it, vi } from "vitest";
import { createBotVerifier } from "@/twin/infra/bot-check";

// The BotID SDK reads the live request's headers; stand in for it at the package boundary.
// Shape from botid/dist/server/index.d.ts: { isHuman, isBot, isVerifiedBot, bypassed, ... }.
const checkBotId = vi.hoisted(() => vi.fn());
vi.mock("botid/server", () => ({ checkBotId }));

describe("bot verifier", () => {
  beforeEach(() => {
    checkBotId.mockReset();
  });

  it("reports a bot when BotID does", async () => {
    checkBotId.mockResolvedValue({ isHuman: false, isBot: true, isVerifiedBot: false, bypassed: false });
    expect(await createBotVerifier().isBot()).toBe(true);
  });

  it("lets a human through", async () => {
    checkBotId.mockResolvedValue({ isHuman: true, isBot: false, isVerifiedBot: false, bypassed: false });
    expect(await createBotVerifier().isBot()).toBe(false);
  });

  it("propagates a BotID failure, so the request fails closed", async () => {
    checkBotId.mockImplementation(async () => {
      throw new Error("BotID unavailable");
    });
    await expect(createBotVerifier().isBot()).rejects.toThrow("BotID unavailable");
  });
});
