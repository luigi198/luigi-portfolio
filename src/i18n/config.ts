export const LOCALES = ["en", "es"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Open Graph locale codes; language-only tags keep the site global. */
export const OG_LOCALE: Record<Locale, string> = {
  en: "en_US",
  es: "es_ES",
};

const LOCALE_SET: ReadonlySet<string> = new Set(LOCALES);

export function isLocale(value: string): value is Locale {
  return LOCALE_SET.has(value);
}
