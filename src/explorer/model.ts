import { ALL_AREAS, type AreaId, type Selection } from "./types";

/** A project counts as end-to-end when it used at least this many areas. */
export const END_TO_END_MIN_AREAS = 3;

interface HasAreas {
  areas: readonly AreaId[];
}

/**
 * Projects that crossed more areas come first; ties keep the curated order.
 * Array.prototype.sort is stable. O(n log n) time, O(n) space for the copy.
 */
export function orderByBreadth<P extends HasAreas>(projects: readonly P[]): P[] {
  return [...projects].sort((a, b) => b.areas.length - a.areas.length);
}

export function projectsInArea<P extends HasAreas>(projects: readonly P[], area: AreaId): P[] {
  return projects.filter((p) => p.areas.includes(area));
}

export function endToEndProjects<P extends HasAreas>(projects: readonly P[]): P[] {
  return projects.filter((p) => p.areas.length >= END_TO_END_MIN_AREAS);
}

export function isRelevant(project: HasAreas, selection: Selection): boolean {
  if (selection === ALL_AREAS) return true;
  return project.areas.includes(selection);
}

/** Reads a selection from a URL hash such as "#data"; anything unknown is null. */
export function parseSelection(hash: string, areaIds: readonly AreaId[]): Selection | null {
  const value = hash.startsWith("#") ? hash.slice(1) : hash;
  if (value === ALL_AREAS) return ALL_AREAS;
  return areaIds.find((id) => id === value) ?? null;
}

/**
 * Layer index of every area a project used, in the project's own order.
 * Throws on bad content so a broken project fails the build instead of
 * rendering on the wrong layer. O(L + A) time.
 */
export function layerRows(project: HasAreas & { id: string }, layerOrder: readonly AreaId[]): number[] {
  if (project.areas.length === 0) throw new Error(`Project "${project.id}" has an empty areas list`);
  const indexOf = new Map(layerOrder.map((id, i) => [id, i]));
  return project.areas.map((id) => {
    const row = indexOf.get(id);
    if (row === undefined) throw new Error(`Project "${project.id}" uses unknown area "${id}"`);
    return row;
  });
}

/** A project's areas in the order the layers are drawn. */
export function areasUsed(project: HasAreas, layerOrder: readonly AreaId[]): AreaId[] {
  const used = new Set(project.areas);
  return layerOrder.filter((id) => used.has(id));
}
