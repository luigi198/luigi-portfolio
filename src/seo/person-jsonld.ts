import type { Locale } from "@/i18n/config";
import { localizedUrl } from "./alternates";

export const PERSON_NAME = "Luis Cordoba";

/** schema.org Person — helps Google build a knowledge panel for the name. */
export function buildPersonJsonLd(locale: Locale, jobTitle: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: PERSON_NAME,
    jobTitle,
    url: localizedUrl(locale, "/"),
    // TODO(bio): add sameAs (LinkedIn, GitHub), knowsAbout, alumniOf, address.
    sameAs: [] as string[],
  };
}
