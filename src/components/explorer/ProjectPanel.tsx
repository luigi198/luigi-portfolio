import { areasUsed } from "@/explorer/model";
import type { Area, AreaId, Project } from "@/explorer/types";
import type { ExplorerCopy } from "./copy";
import { fillArea, siteHost } from "./format";
import { SitePreview } from "./SitePreview";
import { AreaChips, CtaLink } from "./ui";

interface Props {
  project: Project;
  /** Every area, in layer order. */
  areas: readonly Area[];
  /** Mid-sentence name of the view the visitor came from. */
  backTo: string;
  copy: ExplorerCopy;
  onArea: (id: AreaId) => void;
  onBack: () => void;
}

export function ProjectPanel({ project, areas, backTo, copy, onArea, onBack }: Props) {
  const used = new Set(areasUsed(project, areas.map((a) => a.id)));

  return (
    <>
      <p className="mb-4">
        <button type="button" onClick={onBack} className="font-semibold underline decoration-rule decoration-2 underline-offset-[3px]">
          {fillArea(copy.back, backTo)}
        </button>
      </p>
      <h2 className="text-[clamp(2rem,6.5vw,4.25rem)] leading-none font-bold tracking-[-0.04em] text-bright [overflow-wrap:anywhere]">
        {project.title}
      </h2>
      <p className="mt-3 text-muted">{project.client}</p>
      <p className="mt-6 mb-4 max-w-[40rem] text-[clamp(1.375rem,3vw,1.875rem)] leading-tight font-semibold tracking-[-0.025em]">
        {project.metric}
      </p>
      <p className="mb-8 max-w-[40rem] text-[1.0625rem]">{project.story}</p>
      {project.sites.length > 0 && (
        <section className="mb-10">
          <h3 className="mb-3 text-muted">{copy.visit}</h3>
          <ul className="grid gap-6 sm:grid-cols-2">
            {project.sites.map((site) => (
              <li key={site.href}>
                <a href={site.href} target="_blank" rel="noopener noreferrer" className="group grid gap-2.5">
                  <SitePreview site={site} altTemplate={copy.preview} sizes="(min-width: 640px) 30rem, 100vw" />
                  <span className="font-semibold underline decoration-rule decoration-2 underline-offset-[3px] group-hover:decoration-ink">
                    {siteHost(site.href)}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
      <h3 className="mb-3 max-w-[40rem] border-b border-rule pb-2 font-semibold">{copy.touched}</h3>
      <AreaChips areas={areas.filter((a) => used.has(a.id))} onArea={onArea} />
      <p className="mt-10">
        <CtaLink>{copy.projectBook}</CtaLink>
      </p>
    </>
  );
}
