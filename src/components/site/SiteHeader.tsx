import { CtaLink } from "@/components/explorer/ui";
import type { Locale } from "@/i18n/config";
import { LOCALES } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { ThemeToggle } from "./ThemeToggle";

interface Props {
  name: string;
  locale: Locale;
  copy: Dictionary["site"];
}

export function SiteHeader({ name, locale, copy }: Props) {
  return (
    <header className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 pt-6">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <strong className="text-[1.0625rem] font-bold tracking-[-0.01em]">{name}</strong>
        <span className="text-muted">{copy.role}</span>
      </div>
      <div className="flex flex-wrap items-center gap-2.5">
        <ThemeToggle lightLabel={copy.lightMode} darkLabel={copy.darkMode} />
        <nav aria-label={copy.languageGroup} className="flex rounded-full border border-rule p-0.5 text-sm font-medium">
          {LOCALES.map((l) =>
            l === locale ? (
              <span key={l} aria-current="page" className="rounded-full bg-ink px-3 py-1 text-ground uppercase">
                {l}
              </span>
            ) : (
              // Plain <a>, not next/link: each locale has its own root layout, so a client
              // navigation re-renders <html> with the default theme and skips the boot script.
              <a key={l} href={`/${l}`} hrefLang={l} aria-label={copy.switchLanguage} className="rounded-full px-3 py-1 text-muted uppercase hover:text-ink">
                {l}
              </a>
            ),
          )}
        </nav>
        <CtaLink>{copy.book}</CtaLink>
      </div>
    </header>
  );
}
