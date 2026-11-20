import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { LOCALES, OG_LOCALE } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { buildAlternates } from "@/seo/alternates";
import { PERSON_NAME } from "@/seo/person-jsonld";
import { getSiteUrl } from "@/site/url";
import { DEFAULT_THEME, THEME_BOOT_SCRIPT, THEME_COLORS } from "@/theme/theme";
import "../globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export const viewport: Viewport = {
  // The boot script and the toggle keep this in step with the active theme.
  themeColor: THEME_COLORS[DEFAULT_THEME],
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { meta } = await getDictionary();
  const alternates = buildAlternates(locale, "/");

  return {
    metadataBase: new URL(getSiteUrl()),
    title: { default: meta.title, template: `%s — ${PERSON_NAME}` },
    description: meta.description,
    authors: [{ name: PERSON_NAME }],
    creator: PERSON_NAME,
    alternates,
    openGraph: {
      type: "profile",
      siteName: PERSON_NAME,
      title: meta.title,
      description: meta.description,
      url: alternates.canonical,
      locale: OG_LOCALE[locale],
      alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
    },
    twitter: { card: "summary_large_image", title: meta.title, description: meta.description },
    robots: { index: true, follow: true },
  };
}

export default async function LocaleLayout({ children }: LayoutProps<"/[lang]">) {
  const locale = await getLocale();
  return (
    // The boot script may switch data-theme before hydration; that difference is expected.
    <html
      lang={locale}
      data-theme={DEFAULT_THEME}
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Plain inline script, not next/script: it must run before first paint. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body className="min-h-full">
        {children}
      </body>
    </html>
  );
}
