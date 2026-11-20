import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HomeView } from "@/components/home/HomeView";
import { AreaPanel } from "@/components/explorer/AreaPanel";
import { ProjectPanel } from "@/components/explorer/ProjectPanel";
import { AREAS } from "@/content/explorer/areas";
import { PROJECTS } from "@/content/explorer/projects";
import en from "@/i18n/dictionaries/en.json";
import es from "@/i18n/dictionaries/es.json";
import { localizeArea, localizeProject } from "@/explorer/localize";

const YEAR = /\b(19|20)\d{2}\b/;
const noop = () => {};

/** Visible text only: drops tags so attribute values can't satisfy or break assertions. */
const textOf = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

describe("HomeView", () => {
  const enHtml = renderToStaticMarkup(<HomeView locale="en" dictionary={en} />);
  const esHtml = renderToStaticMarkup(<HomeView locale="es" dictionary={es} />);

  it("shows all five areas and every project in English", () => {
    const text = textOf(enHtml);
    for (const a of AREAS) expect(text).toContain(a.name.en);
    for (const p of PROJECTS) expect(text).toContain(p.title.en);
  });

  it("shows the Spanish copy on the Spanish page", () => {
    const text = textOf(esHtml);
    for (const a of AREAS) expect(text).toContain(a.name.es);
    for (const p of PROJECTS) expect(text).toContain(p.title.es);
    expect(text).toContain(es.home.headline);
    expect(text).not.toContain(en.home.headline);
  });

  it("orders the map's project columns from most areas used to fewest", () => {
    const columnIds = [...enHtml.matchAll(/data-column="([^"]+)"/g)].map((m) => m[1]);
    expect(columnIds).toHaveLength(PROJECTS.length);
    const counts = columnIds.map((id) => PROJECTS.find((p) => p.id === id)!.areas.length);
    expect(counts).toEqual([...counts].sort((a, b) => b - a));
  });

  it("never shows a year anywhere on the page", () => {
    expect(textOf(enHtml)).not.toMatch(YEAR);
    expect(textOf(esHtml)).not.toMatch(YEAR);
  });

  it("links to the other language and to the contact section", () => {
    expect(enHtml).toContain('href="/es"');
    expect(esHtml).toContain('href="/en"');
    expect(enHtml).toMatch(/<a[^>]*href="#contact"[^>]*>Book a call<\/a>/);
    expect(enHtml).toContain('id="contact"');
  });

  it("labels the sample content as a preview", () => {
    expect(textOf(enHtml)).toContain(en.site.sample);
  });

  it("opens on the all-areas overview with the end-to-end projects", () => {
    const text = textOf(enHtml);
    expect(text).toContain(en.explorer.allName);
    expect(text).toContain(en.explorer.endToEnd);
  });
});

describe("AreaPanel", () => {
  const area = localizeArea(AREAS.find((a) => a.id === "data")!, "en");
  const projects = PROJECTS.map((p) => localizeProject(p, "en"));
  const html = renderToStaticMarkup(
    <AreaPanel area={area} projects={projects} copy={en.explorer} onProject={noop} />,
  );
  const text = textOf(html);

  it("shows what I know, what I've done and what I can do for the area", () => {
    for (const tool of area.know) expect(text).toContain(tool);
    for (const offer of area.can) expect(text).toContain(offer);
    expect(text).toContain("Retail sales warehouse");
  });

  it("leaves out projects that did not use the area", () => {
    expect(text).not.toContain("Bank onboarding app");
  });

  it("offers the AI-twin preview for the area", () => {
    expect(text).toContain("Ask the AI version of me about data engineering");
  });
});

describe("ProjectPanel", () => {
  const project = localizeProject(PROJECTS.find((p) => p.id === "field")!, "en");
  const areas = AREAS.map((a) => localizeArea(a, "en"));
  const html = renderToStaticMarkup(
    <ProjectPanel project={project} areas={areas} backTo="Data engineering" copy={en.explorer} onArea={noop} onBack={noop} />,
  );
  const text = textOf(html);

  it("shows the result, the story and a screenshot slot", () => {
    expect(text).toContain(project.metric);
    expect(text).toContain(project.story);
    expect(text).toContain(en.explorer.shot);
  });

  it("lists only the areas the project used, in layer order", () => {
    const shown = [...html.matchAll(/data-area="([^"]+)"/g)].map((m) => m[1]);
    expect(shown).toEqual(["mobile", "full-stack", "databases"]);
  });

  it("ends with a book-a-call link to the contact section", () => {
    expect(html).toMatch(/<a[^>]*href="#contact"[^>]*>Book a call about a project like this<\/a>/);
  });
});
