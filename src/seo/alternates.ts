import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/i18n/config";
import { getSiteUrl } from "@/site/url";

const X_DEFAULT = "x-default";

/** Absolute URL for `path` (e.g. "/" or "/projects") in `locale`. */
export function localizedUrl(locale: Locale, path: string): string {
  if (!path.startsWith("/")) {
    throw new Error(`path must start with "/": received "${path}"`);
  }
  const suffix = path === "/" ? "" : path;
  return `${getSiteUrl()}/${locale}${suffix}`;
}

export interface Alternates {
  canonical: string;
  languages: Record<string, string>;
}

/** Canonical + hreflang map for one logical page across all locales. */
export function buildAlternates(locale: Locale, path: string): Alternates {
  const languages: Record<string, string> = {};
  for (const l of LOCALES) languages[l] = localizedUrl(l, path);
  languages[X_DEFAULT] = localizedUrl(DEFAULT_LOCALE, path);

  return { canonical: localizedUrl(locale, path), languages };
}
