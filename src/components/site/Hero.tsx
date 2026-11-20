import Image from "next/image";
import { AskTwinLink } from "@/components/twin/AskTwinLink";
import type { Dictionary } from "@/i18n/dictionaries";

/** Served from /public; 400×400 source, shown at up to 7rem. */
const PHOTO_SRC = "/images/luis-cordoba.jpg";
const PHOTO_SIZE_PX = 400;

export function Hero({ copy }: { copy: Dictionary["home"] }) {
  return (
    <section className="grid max-w-[60rem] gap-x-9 gap-y-6 pt-10 pb-9 sm:grid-cols-[auto_minmax(0,1fr)] sm:pt-14">
      <Image
        src={PHOTO_SRC}
        width={PHOTO_SIZE_PX}
        height={PHOTO_SIZE_PX}
        alt={copy.photoAlt}
        priority
        sizes="(min-width: 640px) 7rem, 5.5rem"
        className="mt-1.5 aspect-square w-22 rounded-3xl object-cover sm:w-28"
      />
      <div>
        <h1 className="mb-5 text-[clamp(2.125rem,5.2vw,3.75rem)] leading-[1.05] font-bold tracking-[-0.035em] text-balance text-bright">
          {copy.headline}
        </h1>
        <p className="max-w-[38rem] text-[1.1875rem] text-muted">{copy.intro}</p>
        <div className="mt-7">
          <AskTwinLink label={copy.ask} />
        </div>
      </div>
    </section>
  );
}
