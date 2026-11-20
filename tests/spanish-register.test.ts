import { describe, expect, it } from "vitest";
import { AREAS } from "@/content/explorer/areas";
import { PROJECTS } from "@/content/explorer/projects";
import { NEEDS } from "@/content/explorer/needs";
import { EXAMPLES } from "@/content/twin/examples";
import { REPLIES } from "@/content/twin/replies";
import es from "@/i18n/dictionaries/es.json";

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

/**
 * Informal "tú" pronouns and verb forms. Costa Rican clients expect "usted".
 * Word-boundary match with Spanish letters, so "tú" and "tus" match but "estudio" doesn't.
 */
const TU_FORMS = [
  "tú", "tu", "tus", "ti", "te", "contigo",
  "eres", "estás", "tienes", "puedes", "quieres", "necesitas", "haces", "has",
  "usas", "trabajas", "cobras", "disfrutas", "abordas", "manejas", "empiezas", "resolviste",
  "escribes", "buscas", "tomes", "vas",
  "cuéntame", "pregúntale", "elige", "contratarte", "guiarte",
];
const LETTER = "a-záéíóúüñ";
const TU = new RegExp(`(^|[^${LETTER}])(${TU_FORMS.join("|")})(?=[^${LETTER}]|$)`, "i");

describe("Spanish copy", () => {
  it("is collected from the dictionary and every content file", () => {
    expect(SPANISH_COPY.length).toBeGreaterThan(100);
  });

  it("addresses the visitor as usted, never tú", () => {
    for (const text of SPANISH_COPY) expect(text).not.toMatch(TU);
  });

  it("uses usted for the booking call to action", () => {
    expect(es.site.book).toBe("Agende una llamada");
  });
});
