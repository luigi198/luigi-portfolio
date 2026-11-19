import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { buildPersonJsonLd, PERSON_NAME } from "@/seo/person-jsonld";
import { JsonLd } from "@/seo/JsonLd";

export default async function HomePage() {
  const locale = await getLocale();
  const { home, meta } = await getDictionary();
  const otherLocale = locale === "en" ? "es" : "en";

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-6 px-6 py-24">
      <JsonLd data={buildPersonJsonLd(locale, meta.jobTitle)} />
      <p className="font-mono text-sm uppercase tracking-widest opacity-60">{home.eyebrow}</p>
      <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">{PERSON_NAME}</h1>
      <p className="text-2xl">{home.headline}</p>
      <p className="opacity-70">{home.intro}</p>
      <Link href={`/${otherLocale}`} hrefLang={otherLocale} className="underline underline-offset-4">
        {home.switchLanguage}
      </Link>
    </main>
  );
}
