import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HomeView } from "@/components/home/HomeView";
import { AreaPanel } from "@/components/explorer/AreaPanel";
import { AREAS } from "@/content/explorer/areas";
import { localizeArea } from "@/explorer/localize";
import { ChatFailureNote } from "@/components/twin/ChatFailureNote";
import type { ChatFailure } from "@/components/twin/stream";
import { localizeStarters } from "@/twin/localize";
import { MAX_MESSAGE_CHARS } from "@/twin/policy";
import { STARTER_IDS } from "@/content/twin/starters";
import { BOOKING_URL } from "@/site/links";
import en from "@/i18n/dictionaries/en.json";
import es from "@/i18n/dictionaries/es.json";

const FAILURES: ChatFailure[] = ["blocked", "limited", "invalid", "conversation-cap", "over-budget", "unavailable", "failed"];
const textOf = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/&#x27;/g, "'").replace(/&amp;/g, "&").replace(/\s+/g, " ");

describe("localizeStarters", () => {
  it("returns each starter question with its prewritten answer, in order", () => {
    const starters = localizeStarters("es");
    expect(starters).toHaveLength(STARTER_IDS.length);
    for (const s of starters) {
      expect(s.question.trim()).not.toBe("");
      expect(s.answer.trim()).not.toBe("");
    }
  });
});

describe("twin chat on the home page", () => {
  const enHtml = renderToStaticMarkup(<HomeView locale="en" dictionary={en} />);
  const esHtml = renderToStaticMarkup(<HomeView locale="es" dictionary={es} />);

  it("labels the chat as an AI and shows the privacy notice", () => {
    for (const [html, copy] of [[enHtml, en], [esHtml, es]] as const) {
      const text = textOf(html);
      expect(text).toContain(copy.twin.title);
      expect(text).toContain(copy.twin.label);
      expect(text).toContain(copy.twin.notice);
    }
  });

  it("offers the starter questions in the page's language", () => {
    for (const s of localizeStarters("en")) expect(textOf(enHtml)).toContain(s.question);
    for (const s of localizeStarters("es")) expect(textOf(esHtml)).toContain(s.question);
  });

  it("caps the message box at the server's character limit", () => {
    expect(enHtml).toMatch(new RegExp(`<textarea[^>]*maxLength="${MAX_MESSAGE_CHARS}"`));
  });

  it("links each area's instant answer to the live chat section", () => {
    const area = localizeArea(AREAS.find((a) => a.id === "data")!, "en");
    const panel = renderToStaticMarkup(<AreaPanel area={area} projects={[]} copy={en.explorer} onProject={() => {}} />);
    expect(panel).toMatch(new RegExp(`<a[^>]*href="#twin"[^>]*>${en.explorer.moreInChat}</a>`));
    expect(enHtml).toMatch(/<section[^>]*id="twin"/);
  });
});

describe("ChatFailureNote", () => {
  it("explains every failure in both languages, never with an empty message", () => {
    for (const copy of [en.twin, es.twin]) {
      for (const failure of FAILURES) {
        const text = textOf(renderToStaticMarkup(<ChatFailureNote failure={failure} copy={copy} book="Book" />));
        expect(text.trim(), failure).not.toBe("");
        expect(text).not.toContain("{max}");
      }
    }
  });

  it("hands off to booking when the chat can't continue", () => {
    for (const failure of FAILURES.filter((f) => f !== "invalid")) {
      const html = renderToStaticMarkup(<ChatFailureNote failure={failure} copy={en.twin} book="Book a call" />);
      expect(html, failure).toContain(`href="${BOOKING_URL}"`);
    }
  });

  it("asks for a shorter message without a booking link", () => {
    const html = renderToStaticMarkup(<ChatFailureNote failure="invalid" copy={en.twin} book="Book a call" />);
    expect(textOf(html)).toContain(String(MAX_MESSAGE_CHARS));
    expect(html).not.toContain(BOOKING_URL);
  });
});
