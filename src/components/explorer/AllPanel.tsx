import { endToEndProjects } from "@/explorer/model";
import type { Area, AreaId, Project } from "@/explorer/types";
import type { ExplorerCopy } from "./copy";
import { LiveGallery } from "./LiveGallery";
import { AreaChips, COLUMNS_CLASS, PITCH_CLASS, PanelHead, ProjectLinks, SectionTitle } from "./ui";

interface Props {
  areas: readonly Area[];
  projects: readonly Project[];
  copy: ExplorerCopy;
  onArea: (id: AreaId) => void;
  onProject: (id: string) => void;
}

/** Overview for "someone to own all of it": the live work, how an engagement runs, and the end-to-end projects. */
export function AllPanel({ areas, projects, copy, onArea, onProject }: Props) {
  const endToEnd = endToEndProjects(projects);

  return (
    <>
      <PanelHead
        title={copy.allName}
        stats={[
          [copy.allAreas, areas.length],
          [copy.allProjects, endToEnd.length],
        ]}
      />
      <p className={PITCH_CLASS}>{copy.allPitch}</p>
      <LiveGallery projects={projects} copy={copy} onProject={onProject} />
      <div className={COLUMNS_CLASS}>
        <section className="min-w-0">
          <SectionTitle>{copy.how}</SectionTitle>
          {/* A real sequence, so the numbers carry meaning. */}
          <ol className="grid gap-3">
            {copy.steps.map((step, i) => (
              <li key={step} className="grid grid-cols-[1.75rem_1fr]">
                <span className="text-lg leading-snug font-bold">{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </section>
        <section className="min-w-0">
          <SectionTitle>{copy.endToEnd}</SectionTitle>
          <ProjectLinks projects={endToEnd} accent="var(--ink)" onProject={onProject} />
        </section>
        <section className="min-w-0">
          <SectionTitle>{copy.can}</SectionTitle>
          <AreaChips areas={areas} onArea={onArea} />
        </section>
      </div>
    </>
  );
}
