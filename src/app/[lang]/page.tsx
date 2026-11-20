import { HomeView } from "@/components/home/HomeView";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { JsonLd } from "@/seo/JsonLd";
import { buildPersonJsonLd } from "@/seo/person-jsonld";

export default async function HomePage() {
  const locale = await getLocale();
  const dictionary = await getDictionary();

  return (
    <>
      <JsonLd data={buildPersonJsonLd(locale, dictionary.meta.jobTitle)} />
      <HomeView locale={locale} dictionary={dictionary} />
    </>
  );
}
