import { describe, expect, it } from "vitest";
import { AREAS } from "@/content/explorer/areas";
import { NEEDS } from "@/content/explorer/needs";
import { PROJECTS } from "@/content/explorer/projects";
import en from "@/i18n/dictionaries/en.json";
import es from "@/i18n/dictionaries/es.json";
import { localizeArea, localizeNeed, localizeProject } from "@/explorer/localize";
import { ALL_AREAS } from "@/explorer/types";

const YEAR = /\b(19|20)\d{2}\b/;
const areaIds = new Set(AREAS.map((a) => a.id));

/** Dotted key paths of a nested object, e.g. "explorer.hint". */
function keyPaths(value: unknown, prefix = ""): string[] {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return [prefix];
  return Object.entries(value).flatMap(([k, v]) => keyPaths(v, prefix ? `${prefix}.${k}` : k));
}

describe("explorer content", () => {
  it("defines the five areas once each", () => {
    expect(AREAS.map((a) => a.id)).toEqual(["mobile", "full-stack", "agentic-ai", "data", "databases"]);
  });

  it("gives every project at least one known area and a unique id", () => {
    const ids = PROJECTS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const p of PROJECTS) {
      expect(p.areas.length, p.id).toBeGreaterThan(0);
      for (const a of p.areas) expect(areaIds.has(a), `${p.id} → ${a}`).toBe(true);
    }
  });

  it("offers a need for every area plus one for all of them", () => {
    const targets = NEEDS.map((n) => n.target);
    expect(new Set(targets)).toEqual(new Set([...areaIds, ALL_AREAS]));
  });

  it("only links to https sites", () => {
    for (const p of PROJECTS) for (const link of p.links ?? []) expect(new URL(link).protocol, p.id).toBe("https:");
  });

  it("never mentions a year in any project or area text", () => {
    const text = JSON.stringify([PROJECTS, AREAS]);
    expect(text).not.toMatch(YEAR);
  });
});

describe("dictionaries", () => {
  it("have the same keys in English and Spanish", () => {
    expect(keyPaths(es).sort()).toEqual(keyPaths(en).sort());
  });

  it("never mention a year in the explorer copy", () => {
    expect(JSON.stringify([en.explorer, es.explorer])).not.toMatch(YEAR);
  });
});

describe("localize", () => {
  const [area] = AREAS;
  const [project] = PROJECTS;

  it("resolves an area to the requested locale", () => {
    const es = localizeArea(area, "es");
    expect(es.name).toBe(area.name.es);
    expect(es.can).toEqual(area.can.es);
    expect(es.twin).toEqual(area.twin.es);
    expect(es.know).toEqual(area.know);
  });

  it("resolves a project to the requested locale and keeps its areas", () => {
    const en = localizeProject(project, "en");
    expect(en).toEqual({
      id: project.id,
      areas: project.areas,
      title: project.title.en,
      client: project.client.en,
      metric: project.metric.en,
      story: project.story.en,
      links: project.links ?? [],
    });
  });

  it("resolves a need label", () => {
    expect(localizeNeed(NEEDS[0], "es").label).toBe(NEEDS[0].label.es);
  });
});
