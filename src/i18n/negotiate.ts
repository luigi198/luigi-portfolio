import { DEFAULT_LOCALE, isLocale, type Locale } from "./config";

const DEFAULT_QUALITY = 1;

interface LanguageRange {
  language: string;
  quality: number;
}

function parseRange(entry: string): LanguageRange | null {
  const [tag, ...params] = entry.trim().split(";");
  const language = tag.trim().toLowerCase().split("-")[0];
  if (!language) return null;

  const qParam = params.find((p) => p.trim().startsWith("q="));
  const quality = qParam ? Number(qParam.trim().slice(2)) : DEFAULT_QUALITY;
  if (!Number.isFinite(quality) || quality <= 0) return null;

  return { language, quality };
}

/**
 * Picks the best supported locale from an Accept-Language header.
 * O(n log n) in the number of header entries (sort); headers are tiny.
 */
export function negotiateLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;

  const ranked = acceptLanguage
    .split(",")
    .map(parseRange)
    .filter((r): r is LanguageRange => r !== null)
    .sort((a, b) => b.quality - a.quality);

  const match = ranked.find((r) => isLocale(r.language));
  return match && isLocale(match.language) ? match.language : DEFAULT_LOCALE;
}
