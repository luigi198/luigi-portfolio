import type { Locale } from "@/i18n/config";
import type { Area, AreaContent, Need, NeedContent, Project, ProjectContent } from "./types";

export function localizeArea(area: AreaContent, locale: Locale): Area {
  return {
    id: area.id,
    name: area.name[locale],
    topic: area.topic[locale],
    pitch: area.pitch[locale],
    know: area.know,
    can: area.can[locale],
    twin: area.twin[locale],
  };
}

export function localizeProject(project: ProjectContent, locale: Locale): Project {
  return {
    id: project.id,
    areas: project.areas,
    title: project.title[locale],
    client: project.client[locale],
    metric: project.metric[locale],
    story: project.story[locale],
    sites: project.sites ?? [],
  };
}

export function localizeNeed(need: NeedContent, locale: Locale): Need {
  return { target: need.target, label: need.label[locale] };
}
