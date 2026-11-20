import type { ReactNode } from "react";
import type { Area, AreaId, Project } from "@/explorer/types";
import { areaColor } from "./format";

export const CONTACT_HREF = "#contact";

export function CtaLink({ children, large = false }: { children: ReactNode; large?: boolean }) {
  const size = large ? "px-6 py-3 text-[1.0625rem]" : "px-4 py-2 text-[0.9375rem]";
  return (
    <a
      href={CONTACT_HREF}
      className={`inline-flex items-center rounded-full bg-cta font-semibold text-cta-ink transition-shadow hover:shadow-[0_0_0_4px_color-mix(in_srgb,var(--cta)_22%,transparent)] ${size}`}
    >
      {children}
    </a>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <h3 className="mb-3.5 border-b border-rule pb-2 font-semibold">{children}</h3>;
}

export function AreaChips({ areas, onArea }: { areas: readonly Area[]; onArea: (id: AreaId) => void }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {areas.map((a) => (
        <li key={a.id}>
          <button
            type="button"
            data-area={a.id}
            onClick={() => onArea(a.id)}
            className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-semibold"
            style={{
              background: `color-mix(in srgb, ${areaColor(a.id)} var(--tint), var(--surface))`,
              borderColor: `color-mix(in srgb, ${areaColor(a.id)} 45%, transparent)`,
            }}
          >
            <i className="size-2.5 rounded-full" style={{ background: areaColor(a.id) }} />
            {a.name}
          </button>
        </li>
      ))}
    </ul>
  );
}

export function ProjectLinks({
  projects,
  accent,
  onProject,
}: {
  projects: readonly Project[];
  accent: string;
  onProject: (id: string) => void;
}) {
  return (
    <ul className="grid gap-2.5">
      {projects.map((p) => (
        <li key={p.id} className="grid gap-0.5">
          <button
            type="button"
            onClick={() => onProject(p.id)}
            className="text-left font-semibold underline decoration-2 underline-offset-[3px]"
            style={{ textDecorationColor: accent }}
          >
            {p.title}
          </button>
          <small className="text-sm text-muted">{p.metric}</small>
        </li>
      ))}
    </ul>
  );
}

export function PanelHead({ title, stats }: { title: string; stats: readonly [string, number][] }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
      <h2 className="text-[clamp(2rem,6.5vw,4.25rem)] leading-none font-bold tracking-[-0.04em] text-bright [overflow-wrap:anywhere]">
        {title}
      </h2>
      <dl className="flex gap-8">
        {stats.map(([label, value]) => (
          <div key={label} className="grid">
            <dt className="text-[0.8125rem] text-muted">{label}</dt>
            <dd className="text-[2rem] leading-tight font-bold tracking-[-0.03em] tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
    </header>
  );
}

export const PITCH_CLASS = "my-5 mb-8 max-w-[40rem] text-xl tracking-[-0.01em]";
export const COLUMNS_CLASS = "grid gap-8 md:grid-cols-3 md:gap-10";
