import { createHash } from "node:crypto";
import { isIPv4, isIPv6 } from "node:net";

/** Stands in for a missing IP header, so those requests still share one rate limit. */
const UNKNOWN_IP = "unknown";
/** Hextets in a full IPv6 address, and in the /64 network a single customer usually controls. */
const IPV6_HEXTETS = 8;
const IPV6_NETWORK_HEXTETS = 4;
const IPV4_MAPPED_PREFIX = "::ffff:";

/** Expands "::" so every address has eight hextets, without leading zeros. */
function hextets(ip: string): string[] {
  const [head, tail] = ip.split("::");
  const left = head ? head.split(":") : [];
  const right = tail ? tail.split(":") : [];
  const zeros = Array<string>(IPV6_HEXTETS - left.length - right.length).fill("0");
  const all = tail === undefined ? left : [...left, ...zeros, ...right];
  return all.map((h) => h.replace(/^0+(?=.)/, "").toLowerCase());
}

/**
 * The part of the address that identifies one visitor. IPv6 users typically get a
 * whole /64, so keying on the full address would hand out fresh rate limits per address.
 */
function rateKeyOf(ip: string): string {
  const lower = ip.toLowerCase();
  if (lower.startsWith(IPV4_MAPPED_PREFIX) && isIPv4(lower.slice(IPV4_MAPPED_PREFIX.length))) {
    return lower.slice(IPV4_MAPPED_PREFIX.length);
  }
  if (!isIPv6(lower)) return lower;
  return `${hextets(lower).slice(0, IPV6_NETWORK_HEXTETS).join(":")}::/64`;
}

/**
 * Salted SHA-256 of the client IP (or its IPv6 /64): stable per visitor for rate
 * limits, but the address itself never reaches logs or the store (research P1). On
 * Vercel the first x-forwarded-for entry is set by the platform, not the client.
 */
export function visitorIdFrom(headers: Headers, salt: string): string {
  const ip = headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip")?.trim() || UNKNOWN_IP;
  return createHash("sha256").update(`${salt}:${rateKeyOf(ip)}`).digest("hex");
}
