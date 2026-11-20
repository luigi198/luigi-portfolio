import type { AreaId } from "@/explorer/types";

/** CSS color for an area; tokens are defined in globals.css as --area-<id>. */
export function areaColor(id: AreaId): string {
  return `var(--area-${id})`;
}

/** Fills the "{area}" placeholder in a dictionary template. */
export function fillArea(template: string, area: string): string {
  // Replacer function so "$&", "$'" etc. in the area are inserted literally.
  return template.replace("{area}", () => area);
}
