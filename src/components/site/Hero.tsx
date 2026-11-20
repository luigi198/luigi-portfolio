import type { Dictionary } from "@/i18n/dictionaries";

export function Hero({ copy }: { copy: Dictionary["home"] }) {
  return (
    <section className="grid max-w-[60rem] gap-x-9 gap-y-6 pt-10 pb-9 sm:grid-cols-[auto_minmax(0,1fr)] sm:pt-14">
      {/* Placeholder until the real photo is added. */}
      <div className="mt-1.5 grid aspect-square w-22 max-w-full place-items-center rounded-3xl border border-dashed border-rule bg-raised p-2 text-center text-xs leading-tight text-muted sm:w-28">
        {copy.photo}
      </div>
      <div>
        <h1 className="mb-5 text-[clamp(2.125rem,5.2vw,3.75rem)] leading-[1.05] font-bold tracking-[-0.035em] text-balance text-bright">
          {copy.headline}
        </h1>
        <p className="max-w-[38rem] text-[1.1875rem] text-muted">{copy.intro}</p>
      </div>
    </section>
  );
}
