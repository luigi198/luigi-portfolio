import type { MetadataRoute } from "next";
import { LOCALES } from "@/i18n/config";
import { buildAlternates } from "@/seo/alternates";

/** Logical pages; every one is emitted once per locale with hreflang links. */
const PAGES = ["/"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.flatMap((path) =>
    LOCALES.map((locale) => {
      const { canonical, languages } = buildAlternates(locale, path);
      return { url: canonical, alternates: { languages } };
    }),
  );
}
