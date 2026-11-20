import { CtaLink } from "@/components/explorer/ui";
import type { Dictionary } from "@/i18n/dictionaries";

interface Props {
  copy: Dictionary["contact"];
  book: string;
}

export function Contact({ copy, book }: Props) {
  return (
    <section id="contact" className="mt-20 grid max-w-[44rem] scroll-mt-6 gap-5 border-t border-rule pt-12">
      <h2 className="text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.1] font-bold tracking-[-0.035em] text-balance text-bright">
        {copy.title}
      </h2>
      <p className="text-[1.0625rem] text-muted">{copy.body}</p>
      <div className="flex flex-wrap items-center gap-4">
        {/* TODO(booking): point at the real calendar link once it exists. */}
        <CtaLink large>{book}</CtaLink>
        <span className="text-sm text-muted">{copy.note}</span>
      </div>
    </section>
  );
}
