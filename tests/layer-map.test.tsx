import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LayerMap } from "@/components/explorer/LayerMap";
import { AREAS } from "@/content/explorer/areas";
import { PROJECTS } from "@/content/explorer/projects";
import { localizeArea, localizeProject } from "@/explorer/localize";
import { orderByBreadth } from "@/explorer/model";
import type { Selection } from "@/explorer/types";

const areas = AREAS.map((a) => localizeArea(a, "en"));
const projects = orderByBreadth(PROJECTS).map((p) => localizeProject(p, "en"));
const noop = () => {};

/** Every dot on the map as "project:area", split by whether it is lit. */
function dots(selection: Selection, projectId: string | null = null) {
  const html = renderToStaticMarkup(
    <LayerMap areas={areas} projects={projects} selection={selection} projectId={projectId} label="map"
      onArea={noop} onProject={noop} onHover={noop} />,
  );
  const lit: string[] = [];
  const dim: string[] = [];
  for (const [, project, area, on] of html.matchAll(/data-dot="([^":]+):([^"]+)" data-lit="(true|false)"/g)) {
    (on === "true" ? lit : dim).push(`${project}:${area}`);
  }
  return { lit, dim };
}

const allDots = PROJECTS.flatMap((p) => p.areas.map((a) => `${p.id}:${a}`));

describe("LayerMap dots", () => {
  it("lights only the dots on the selected layer, for every area", () => {
    for (const area of AREAS) {
      const { lit, dim } = dots(area.id);
      const expected = PROJECTS.filter((p) => p.areas.includes(area.id)).map((p) => `${p.id}:${area.id}`);
      expect(lit.sort()).toEqual(expected.sort());
      expect(lit.length + dim.length).toBe(allDots.length);
    }
  });

  it("lights every dot when all areas are selected", () => {
    const { lit, dim } = dots("all");
    expect(dim).toEqual([]);
    expect(lit.sort()).toEqual([...allDots].sort());
  });

  it("lights every dot of the open project, whatever the selected layer", () => {
    const open = PROJECTS.find((p) => p.areas.length > 1);
    if (!open) throw new Error("fixture needs a project with several areas");
    const other = AREAS.find((a) => !open.areas.includes(a.id));
    if (!other) throw new Error("fixture needs an area the project did not use");
    const { lit } = dots(other.id, open.id);
    for (const a of open.areas) expect(lit).toContain(`${open.id}:${a}`);
  });
});
