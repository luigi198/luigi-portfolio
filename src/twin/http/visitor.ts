import { createHash } from "node:crypto";

/** Stands in for a missing IP header, so those requests still share one rate limit. */
const UNKNOWN_IP = "unknown";

/**
 * Salted SHA-256 of the client IP: stable per visitor for rate limits, but the
 * address itself never reaches logs or the store (research P1). On Vercel the
 * first x-forwarded-for entry is set by the platform, not the client.
 */
export function visitorIdFrom(headers: Headers, salt: string): string {
  const ip = headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip")?.trim() || UNKNOWN_IP;
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}
