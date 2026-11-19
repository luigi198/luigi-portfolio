const LOCAL_FALLBACK = "http://localhost:3000";

/**
 * Absolute origin used for canonical URLs, hreflang, sitemap and OG tags.
 * Read lazily (never at import time). Set NEXT_PUBLIC_SITE_URL once the
 * custom domain exists; until then Vercel's production URL is used.
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;

  return LOCAL_FALLBACK;
}
