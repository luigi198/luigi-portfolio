import { StackExplorer } from "@/components/explorer/StackExplorer";
import { Contact } from "@/components/site/Contact";
import { Hero } from "@/components/site/Hero";
import { SiteHeader } from "@/components/site/SiteHeader";
import { TwinChat } from "@/components/twin/TwinChat";
import { AREAS } from "@/content/explorer/areas";
import { NEEDS } from "@/content/explorer/needs";
import { PROJECTS } from "@/content/explorer/projects";
import { localizeArea, localizeNeed, localizeProject } from "@/explorer/localize";
import { orderByBreadth } from "@/explorer/model";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { PERSON_NAME } from "@/seo/person-jsonld";
import { localizeStarters } from "@/twin/localize";

interface Props {
  locale: Locale;
  dictionary: Dictionary;
}

/** The home page body. Only the visitor's language is sent to the client explorer. */
export function HomeView({ locale, dictionary }: Props) {
  const areas = AREAS.map((a) => localizeArea(a, locale));
  const projects = orderByBreadth(PROJECTS).map((p) => localizeProject(p, locale));
  const needs = NEEDS.map((n) => localizeNeed(n, locale));

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
      <SiteHeader name={PERSON_NAME} locale={locale} copy={dictionary.site} />
      <Hero copy={dictionary.home} />
      <TwinChat locale={locale} copy={dictionary.twin} book={dictionary.site.book} starters={localizeStarters(locale)} />
      <div className="mt-20 border-t border-rule pt-12">
        <StackExplorer areas={areas} projects={projects} needs={needs} copy={dictionary.explorer} />
      </div>
      <Contact copy={dictionary.contact} book={dictionary.site.book} />
    </main>
  );
}
