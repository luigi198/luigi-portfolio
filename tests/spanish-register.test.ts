import { describe, expect, it } from "vitest";
import { AREAS } from "@/content/explorer/areas";
import { PROJECTS } from "@/content/explorer/projects";
import { NEEDS } from "@/content/explorer/needs";
import { EXAMPLES } from "@/content/twin/examples";
import { REPLIES } from "@/content/twin/replies";
import es from "@/i18n/dictionaries/es.json";
import { findTuForm } from "@/i18n/register";

/** Every string leaf under a value. O(n) in the size of the tree. */
function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}

/** Strings under every `es` key, at any depth (content objects are Localized). */
function spanish(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(spanish);
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, v]) => (key === "es" ? strings(v) : spanish(v)));
  }
  return [];
}

const SPANISH_COPY = [...strings(es), ...spanish([AREAS, PROJECTS, NEEDS, EXAMPLES, REPLIES])];

describe("Spanish copy", () => {
  it("is collected from the dictionary and every content file", () => {
    expect(SPANISH_COPY.length).toBeGreaterThan(100);
  });

  it("addresses the visitor as usted, never tú", () => {
    for (const text of SPANISH_COPY) expect(findTuForm(text), text).toBeUndefined();
  });

  it("uses usted for the booking call to action", () => {
    expect(es.site.book).toBe("Agende una llamada");
  });
});
