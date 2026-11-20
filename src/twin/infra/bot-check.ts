import { checkBotId } from "botid/server";
import type { BotVerifier } from "@/twin/ports";

/**
 * Vercel BotID check for the current request (research A1). The route must also
 * be listed in instrumentation-client.ts, or checkBotId() fails. Errors propagate
 * so the service fails closed (A8).
 */
export function createBotVerifier(): BotVerifier {
  return { isBot: async () => (await checkBotId()).isBot };
}
