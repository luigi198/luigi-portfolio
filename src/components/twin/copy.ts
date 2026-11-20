import type { Dictionary } from "@/i18n/dictionaries";

/** The chat's UI strings for one locale. */
export type TwinCopy = Dictionary["twin"];

/** Fills `{name}` placeholders. A replacer function, so `$` in values is never special. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}
