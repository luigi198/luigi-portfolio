import type { Project } from "@/explorer/types";
import type { ExplorerCopy } from "./copy";
import { SitePreview } from "./SitePreview";
import { SectionTitle } from "./ui";

interface Props {
  projects: readonly Project[];
  copy: ExplorerCopy;
  onProject: (id: string) => void;
}

/** Every live site as a screenshot card; a card opens the project behind it. */
export function LiveGallery({ projects, copy, onProject }: Props) {
  const cards = projects.flatMap((project) => project.sites.map((site) => ({ project, site })));
  if (cards.length === 0) return null;

  return (
    <section className="mb-12">
      <SectionTitle>{copy.live}</SectionTitle>
      <ul className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ project, site }) => (
          <li key={site.href}>
            <button
              type="button"
              data-project={project.id}
              onClick={() => onProject(project.id)}
              className="group grid w-full gap-3 text-left"
            >
              <SitePreview site={site} altTemplate={copy.preview} sizes="(min-width: 1024px) 22rem, (min-width: 640px) 45vw, 100vw" />
              <span className="grid gap-0.5">
                <span className="font-semibold text-bright">{project.title}</span>
                <small className="text-sm text-muted">{project.metric}</small>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
