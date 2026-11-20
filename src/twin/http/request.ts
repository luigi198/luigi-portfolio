import { isLocale, type Locale } from "@/i18n/config";
import type { ChatTurn } from "@/twin/types";

/** Far above any valid conversation (10 turns × a few KB); rejects junk before parsing. */
export const MAX_BODY_BYTES = 64 * 1024;
/** Shape-level cap on history entries; the domain policy enforces the real turn limit. */
const MAX_HISTORY_ENTRIES = 40;

export interface TwinBody {
  locale: Locale;
  history: ChatTurn[];
  message: string;
}

export type BodyParse = { ok: true; value: TwinBody } | { ok: false };

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

/** Copies only known fields, so nothing unexpected reaches the domain. */
function toTurn(value: unknown): ChatTurn | undefined {
  if (!isRecord(value) || typeof value.text !== "string") return undefined;
  if (value.role !== "user" && value.role !== "assistant") return undefined;
  return { role: value.role, text: value.text };
}

/** Validates the HTTP body at the system boundary (fail fast). */
export function parseTwinBody(raw: string): BodyParse {
  if (raw.length > MAX_BODY_BYTES) return { ok: false };
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return { ok: false };
  }
  if (!isRecord(json) || typeof json.message !== "string" || typeof json.locale !== "string" || !isLocale(json.locale)) {
    return { ok: false };
  }
  if (!Array.isArray(json.history) || json.history.length > MAX_HISTORY_ENTRIES) return { ok: false };
  const history: ChatTurn[] = [];
  for (const entry of json.history) {
    const turn = toTurn(entry);
    if (!turn) return { ok: false };
    history.push(turn);
  }
  return { ok: true, value: { locale: json.locale, history, message: json.message } };
}
