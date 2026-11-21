import type { Locale } from "@/i18n/config";

/** Boundary types shared by the content (data) layer, the domain model and the UI. */

export type Localized<T> = Record<Locale, T>;

export type AreaId = "mobile" | "full-stack" | "agentic-ai" | "data" | "databases";

/** What the explorer is focused on: one area, or every area at once. */
export type Selection = AreaId | "all";

export const ALL_AREAS = "all" satisfies Selection;

export interface AreaContent {
  id: AreaId;
  name: Localized<string>;
  /** The name as written mid-sentence ("about data engineering", "sobre IA agéntica"). */
  topic: Localized<string>;
  pitch: Localized<string>;
  /** Tool and technique names; not translated. */
  know: readonly string[];
  can: Localized<readonly string[]>;
  twin: Localized<TwinExchange>;
}

export interface ProjectContent {
  id: string;
  /** Areas this project used. No dates on purpose: recency is never shown. */
  areas: readonly AreaId[];
  title: Localized<string>;
  client: Localized<string>;
  metric: Localized<string>;
  story: Localized<string>;
  /** The live product or sites, if any. */
  sites?: readonly ProjectSite[];
}

/** A live site and a screenshot of it, served from /public. */
export interface ProjectSite {
  /** Public https URL. */
  href: string;
  /** Path under /public, e.g. "/images/sites/propiedatos.jpg". 1280×800. */
  preview: string;
}

export interface NeedContent {
  target: Selection;
  label: Localized<string>;
}

export interface TwinExchange {
  question: string;
  answer: string;
}

/** Content resolved to one locale, ready to render. */
export interface Area {
  id: AreaId;
  name: string;
  topic: string;
  pitch: string;
  know: readonly string[];
  can: readonly string[];
  twin: TwinExchange;
}

export interface Project {
  id: string;
  areas: readonly AreaId[];
  title: string;
  client: string;
  metric: string;
  story: string;
  sites: readonly ProjectSite[];
}

export interface Need {
  target: Selection;
  label: string;
}
