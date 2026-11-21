import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HomeView } from "@/components/home/HomeView";
import { AllPanel } from "@/components/explorer/AllPanel";
import { AreaPanel } from "@/components/explorer/AreaPanel";
import { ProjectPanel } from "@/components/explorer/ProjectPanel";
import { AREAS } from "@/content/explorer/areas";
import { PROJECTS } from "@/content/explorer/projects";
import en from "@/i18n/dictionaries/en.json";
import es from "@/i18n/dictionaries/es.json";
import { localizeArea, localizeProject } from "@/explorer/localize";
import { BOOKING_URL } from "@/site/links";

const YEAR = /\b(19|20)\d{2}\b/;
const noop = () => {};
const escaped = BOOKING_URL.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
/** An <a> to the booking page that opens in a new tab, with the given text. */
const bookingLink = (text: string) =>
  new RegExp(`<a[^>]*href="${escaped}"[^>]*target="_blank"[^>]*rel="noopener noreferrer"[^>]*>${text}</a>`);

/** Visible text only: drops tags so attribute values can't satisfy or break assertions. */
const ENTITIES: Record<string, string> = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#x27;": "'" };
const textOf = (html: string) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&(amp|lt|gt|quot|#x27);/g, (e) => ENTITIES[e])
    .replace(/\s+/g, " ");

describe("HomeView", () => {
  const enHtml = renderToStaticMarkup(<HomeView locale="en" dictionary={en} />);
  const esHtml = renderToStaticMarkup(<HomeView locale="es" dictionary={es} />);

  it("shows all five areas and every project in English", () => {
    const text = textOf(enHtml);
    for (const a of AREAS) expect(text).toContain(a.name.en);
    for (const p of PROJECTS) expect(text).toContain(p.title.en);
  });

  it("puts the AI twin chat right after the hero, before the explorer", () => {
    for (const [html, copy] of [[enHtml, en], [esHtml, es]] as const) {
      const hero = html.indexOf(copy.home.headline);
      const chat = html.indexOf('id="twin"');
      const explorer = html.indexOf(copy.explorer.mapLabel);
      expect(hero).toBeGreaterThan(-1);
      expect(chat).toBeGreaterThan(hero);
      expect(explorer).toBeGreaterThan(chat);
    }
  });

  it("finishes the hero headline with its accent, inside the same heading", () => {
    for (const [html, copy] of [[enHtml, en], [esHtml, es]] as const) {
      const h1 = /<h1[^>]*>([\s\S]*?)<\/h1>/.exec(html)?.[1] ?? "";
      expect(textOf(h1).trim()).toBe(`${copy.home.headline} ${copy.home.headlineAccent}`);
    }
  });

  it("links from the hero to the chat in both languages", () => {
    for (const [html, copy] of [[enHtml, en], [esHtml, es]] as const) {
      const heroEnd = html.indexOf('id="twin"');
      expect(html.slice(0, heroEnd)).toMatch(new RegExp(`<a[^>]*href="#twin"[^>]*>${copy.home.ask}</a>`));
    }
  });

  it("gives the chat input a stable id the hero link can focus", () => {
    expect(enHtml).toMatch(/<textarea[^>]*id="twin-input"/);
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

  it("links to the other language and to the booking page", () => {
    expect(enHtml).toContain('href="/es"');
    expect(esHtml).toContain('href="/en"');
    expect(enHtml).toMatch(bookingLink("Book a call"));
    expect(esHtml).toMatch(bookingLink(es.site.book));
  });

  it("shows the photo with the person's name as its description", () => {
    expect(enHtml).toMatch(/<img[^>]*alt="Luis Cordoba"[^>]*>/);
    expect(textOf(enHtml)).not.toContain("Photo coming soon");
  });

  it("features Propiedatos as the first project on the map", () => {
    const [first] = [...enHtml.matchAll(/data-column="([^"]+)"/g)].map((m) => m[1]);
    expect(first).toBe("propiedatos");
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
    expect(text).toContain("Database observability");
  });

  it("leaves out projects that did not use the area", () => {
    expect(text).not.toContain("Angular modernization");
  });

  it("offers the AI-twin preview for the area", () => {
    expect(text).toContain("Ask the AI version of me about data engineering");
  });
});

describe("ProjectPanel", () => {
  const areas = AREAS.map((a) => localizeArea(a, "en"));
  const render = (id: string) => {
    const project = localizeProject(PROJECTS.find((p) => p.id === id)!, "en");
    const html = renderToStaticMarkup(
      <ProjectPanel project={project} areas={areas} backTo="data engineering" copy={en.explorer} onArea={noop} onBack={noop} />,
    );
    return { project, html, text: textOf(html) };
  };
  const { project, html, text } = render("guest-apps");

  it("shows the result and the story", () => {
    expect(text).toContain(project.metric);
    expect(text).toContain(project.story);
  });

  /** Each <a> to a live site (not the booking page): [href, attributes, inner HTML]. */
  const siteLinks = (html: string) =>
    [...html.matchAll(/<a([^>]*)>([\s\S]*?)<\/a>/g)]
      .map(([, attrs, inner]) => [/href="([^"]+)"/.exec(attrs)![1], attrs, inner] as const)
      .filter(([href]) => href !== BOOKING_URL);

  it("links to each live site in a new tab, labelled with its host", () => {
    const links = siteLinks(render("small-business").html);
    expect(links.map(([href]) => href)).toEqual(["https://lactanne.com", "https://solarisbronceado.com", "https://hanslistenia.com"]);
    for (const [href, attrs, inner] of links) {
      expect(attrs, href).toContain('target="_blank"');
      expect(textOf(inner), href).toContain(new URL(href).hostname);
    }
  });

  it("shows a preview of each live site inside its link", () => {
    for (const [href, , inner] of siteLinks(render("small-business").html)) {
      const alt = en.explorer.preview.replace("{site}", new URL(href).hostname);
      expect(inner, href).toMatch(new RegExp(`<img[^>]*alt="${alt}"`));
    }
  });

  it("shows no site links for a project without one", () => {
    expect(html).not.toContain(en.explorer.visit);
  });

  it("lists only the areas the project used, in layer order", () => {
    const shown = [...html.matchAll(/data-area="([^"]+)"/g)].map((m) => m[1]);
    expect(shown).toEqual(["mobile", "full-stack", "databases"]);
  });

  it("ends with a link to book a call", () => {
    expect(html).toMatch(bookingLink("Book a call about a project like this"));
  });
});

describe("AllPanel", () => {
  const areas = AREAS.map((a) => localizeArea(a, "en"));
  const projects = PROJECTS.map((p) => localizeProject(p, "en"));
  const html = renderToStaticMarkup(
    <AllPanel areas={areas} projects={projects} copy={en.explorer} onArea={noop} onProject={noop} />,
  );
  const withSites = projects.filter((p) => p.sites.length > 0);

  it("opens with a gallery of the live sites", () => {
    expect(withSites.length).toBeGreaterThan(0);
    expect(textOf(html)).toContain(en.explorer.live);
    const gallery = html.indexOf(en.explorer.live);
    expect(gallery).toBeLessThan(html.indexOf(en.explorer.how));
  });

  it("shows every live site once, as a button that opens its project", () => {
    const buttons = [...html.matchAll(/<button[^>]*data-project="([^"]+)"[^>]*>([\s\S]*?)<\/button>/g)];
    const expected = withSites.flatMap((p) =>
      p.sites.map((s) => [p.id, en.explorer.preview.replace("{site}", new URL(s.href).hostname.replace(/^www\./, ""))]),
    );
    const shown = buttons.map(([, id, inner]) => [id, /<img[^>]*alt="([^"]+)"/.exec(inner)?.[1]]);
    expect(shown).toEqual(expected);
  });
});
