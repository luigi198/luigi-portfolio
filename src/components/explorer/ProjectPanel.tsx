import { areasUsed } from "@/explorer/model";
import type { Area, AreaId, Project } from "@/explorer/types";
import type { ExplorerCopy } from "./copy";
import { fillArea } from "./format";
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
      {project.links.length > 0 && (
        <p className="mb-8 flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="text-muted">{copy.visit}:</span>
          {project.links.map((href) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline decoration-rule decoration-2 underline-offset-[3px] hover:decoration-ink"
            >
              {new URL(href).hostname.replace(/^www\./, "")}
            </a>
          ))}
        </p>
      )}
      <h3 className="mb-3 max-w-[40rem] border-b border-rule pb-2 font-semibold">{copy.touched}</h3>
      <AreaChips areas={areas.filter((a) => used.has(a.id))} onArea={onArea} />
      <p className="mt-10">
        <CtaLink>{copy.projectBook}</CtaLink>
      </p>
    </>
  );
}
