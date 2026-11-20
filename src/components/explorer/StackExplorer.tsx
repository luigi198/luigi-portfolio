"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ALL_AREAS, type Area, type Need, type Project, type Selection } from "@/explorer/types";
import { AllPanel } from "./AllPanel";
import { AreaPanel } from "./AreaPanel";
import type { ExplorerCopy } from "./copy";
import { areaColor } from "./format";
import { LayerMap } from "./LayerMap";
import { NeedPicker } from "./NeedPicker";
import { ProjectPanel } from "./ProjectPanel";
import { useSelection } from "./useSelection";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

interface Props {
  areas: readonly Area[];
  /** Already in display order (most areas first). */
  projects: readonly Project[];
  needs: readonly Need[];
  copy: ExplorerCopy;
}

export function StackExplorer({ areas, projects, needs, copy }: Props) {
  const areaIds = useMemo(() => areas.map((a) => a.id), [areas]);
  const [selection, select] = useSelection(areaIds);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const panelRef = useRef<HTMLElement>(null);

  const area = selection === ALL_AREAS ? null : (areas.find((a) => a.id === selection) ?? null);
  const project = projects.find((p) => p.id === projectId) ?? null;
  const captioned = projects.find((p) => p.id === (hoveredId ?? projectId)) ?? null;

  function chooseArea(next: Selection) {
    setProjectId(null);
    select(next);
  }

  // Scroll once the new panel has committed; respect reduced motion (CSS can't reach JS scrolling).
  useEffect(() => {
    if (projectId === null) return;
    const reduce = window.matchMedia(REDUCED_MOTION_QUERY).matches;
    panelRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }, [projectId]);

  const panelTitle = project?.title ?? area?.name ?? copy.allName;

  return (
    <div>
      <NeedPicker label={copy.need} needs={needs} active={project ? null : selection} onPick={chooseArea} />
      <LayerMap
        areas={areas}
        projects={projects}
        selection={selection}
        projectId={projectId}
        label={copy.mapLabel}
        onArea={chooseArea}
        onProject={setProjectId}
        onHover={setHoveredId}
      />
      <p className="mt-4 min-h-[1.6em] text-[0.9375rem] text-muted">
        {captioned ? (
          <>
            <b className="font-semibold text-ink">{captioned.title}</b>. {captioned.metric}.
          </>
        ) : (
          copy.hint
        )}
      </p>

      {/* Stable live region: announces only the new panel's title, not the whole panel. */}
      <p aria-live="polite" className="sr-only">
        {panelTitle}
      </p>
      <section
        ref={panelRef}
        key={`${selection}:${projectId ?? ""}`}
        className="mt-10 scroll-mt-6 animate-arrive border-t-[3px] pt-7"
        style={{ borderColor: area && !project ? areaColor(area.id) : "var(--ink)" }}
      >
        {project ? (
          <ProjectPanel
            project={project}
            areas={areas}
            backTo={area ? area.topic : copy.allTopic}
            copy={copy}
            onArea={chooseArea}
            onBack={() => setProjectId(null)}
          />
        ) : area ? (
          <AreaPanel area={area} projects={projects} copy={copy} onProject={setProjectId} />
        ) : (
          <AllPanel areas={areas} projects={projects} copy={copy} onArea={chooseArea} onProject={setProjectId} />
        )}
      </section>
    </div>
  );
}
