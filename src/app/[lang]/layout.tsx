import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { LOCALES, OG_LOCALE } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { buildAlternates } from "@/seo/alternates";
import { PERSON_NAME } from "@/seo/person-jsonld";
import { getSiteUrl } from "@/site/url";
import "../globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
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
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
