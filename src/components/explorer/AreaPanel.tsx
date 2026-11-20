import { projectsInArea } from "@/explorer/model";
import type { Area, Project } from "@/explorer/types";
import type { ExplorerCopy } from "./copy";
import { areaColor, fillArea } from "./format";
import { TwinPreview } from "./TwinPreview";
import { COLUMNS_CLASS, PITCH_CLASS, PanelHead, ProjectLinks, SectionTitle } from "./ui";

interface Props {
  area: Area;
  /** Every project, already in display order. */
  projects: readonly Project[];
  copy: ExplorerCopy;
  onProject: (id: string) => void;
}

export function AreaPanel({ area, projects, copy, onProject }: Props) {
  const done = projectsInArea(projects, area.id);
  const color = areaColor(area.id);

  return (
    <>
      <PanelHead
        title={area.name}
        stats={[
          [copy.projects, done.length],
          [copy.tools, area.know.length],
        ]}
      />
      <p className={PITCH_CLASS}>{area.pitch}</p>
      <div className={COLUMNS_CLASS}>
        <section className="min-w-0">
          <SectionTitle>{copy.know}</SectionTitle>
          <ul className="flex flex-wrap gap-1.5">
            {area.know.map((tool) => (
              <li key={tool} className="rounded border border-rule bg-surface px-2 py-0.5 text-sm">
                {tool}
              </li>
            ))}
          </ul>
        </section>
        <section className="min-w-0">
          <SectionTitle>{copy.done}</SectionTitle>
          <ProjectLinks projects={done} accent={color} onProject={onProject} />
        </section>
        <section className="min-w-0">
          <SectionTitle>{copy.can}</SectionTitle>
          <ul className="grid gap-2.5">
            {area.can.map((offer) => (
              <li key={offer} className="relative pl-[1.1rem]">
                <span className="absolute top-[0.62em] left-0 size-[0.45rem] rounded-full" style={{ background: color }} />
                {offer}
              </li>
            ))}
          </ul>
        </section>
      </div>
      <TwinPreview
        key={area.id}
        exchange={area.twin}
        askLabel={fillArea(copy.ask, area.topic)}
        hideLabel={copy.hide}
        note={copy.twinNote}
      />
    </>
  );
}
