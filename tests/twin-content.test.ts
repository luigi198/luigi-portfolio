import { describe, expect, it } from "vitest";
import { KNOWLEDGE } from "@/content/twin/knowledge";
import { EXAMPLES } from "@/content/twin/examples";
import { STARTER_IDS } from "@/content/twin/starters";
import { REPLIES } from "@/content/twin/replies";
import { LOCALES } from "@/i18n/config";
import { CAREER_YEARS } from "@/site/profile";
import en from "@/i18n/dictionaries/en.json";
import es from "@/i18n/dictionaries/es.json";

const exampleTexts = EXAMPLES.flatMap((e) => LOCALES.flatMap((l) => [e.text[l].question, e.text[l].answer]));
const redirectTexts = LOCALES.map((l) => REPLIES.redirect[l]);
/** Everything the twin's prompt or prewritten answers can show a visitor. */
const ALL_TWIN_TEXT = [KNOWLEDGE, ...exampleTexts, ...redirectTexts];

const EMAIL = /[\w.+-]+@[\w-]+\.[\w.]+/;
const PHONE = /\+?\d[\d\s().-]{6,}\d/;
const SECRET = /\b(sk-[\w-]{8,}|api[_-]?key|password|token:)/i;
const YEAR = /\b(19|20)\d{2}\b/;
const DURATION = /\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten|un|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)\+?\s+(years?|months?|weeks?|años?|meses?|semanas?)\b/gi;
const CAREER_TOTAL = new Set([`${CAREER_YEARS} years`, `${CAREER_YEARS} años`]);
/** About 4 characters per token: comfortably above the 512-token cache minimum. */
const MIN_KNOWLEDGE_CHARS = 4000;

describe("twin content", () => {
  it("has no email, phone number or secret anywhere", () => {
    for (const text of ALL_TWIN_TEXT) {
      expect(text).not.toMatch(EMAIL);
      expect(text).not.toMatch(PHONE);
      expect(text).not.toMatch(SECRET);
    }
  });

  it("never shows a year, and the only duration is the career total", () => {
    for (const text of ALL_TWIN_TEXT) {
      expect(text).not.toMatch(YEAR);
      for (const [match] of text.matchAll(DURATION)) expect(CAREER_TOTAL).toContain(match.toLowerCase());
    }
  });

  it("states the same career total as the site copy", () => {
    expect(KNOWLEDGE).toContain(`${CAREER_YEARS} years`);
    expect(en.home.intro).toContain(`${CAREER_YEARS} years`);
    expect(es.home.intro).toContain(`${CAREER_YEARS} años`);
    expect(en.meta.description).toContain(`${CAREER_YEARS} years`);
    expect(es.meta.description).toContain(`${CAREER_YEARS} años`);
  });

  it("writes every example and fixed reply in every language", () => {
    for (const e of EXAMPLES) {
      for (const l of LOCALES) {
        expect(e.text[l].question.trim(), `${e.id}/${l}`).not.toBe("");
        expect(e.text[l].answer.trim(), `${e.id}/${l}`).not.toBe("");
      }
    }
    for (const text of redirectTexts) expect(text.trim()).not.toBe("");
  });

  it("gives examples unique ids and enough of them to set the voice", () => {
    const ids = EXAMPLES.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.length).toBeGreaterThanOrEqual(15);
    expect(ids.length).toBeLessThanOrEqual(25);
  });

  it("serves every starter question from a prewritten example", () => {
    const ids = new Set(EXAMPLES.map((e) => e.id));
    expect(STARTER_IDS.length).toBeGreaterThan(0);
    for (const id of STARTER_IDS) expect(ids, id).toContain(id);
  });

  it("covers rates and availability without stating a price or a date", () => {
    for (const id of ["rates", "availability"]) {
      const example = EXAMPLES.find((e) => e.id === id);
      expect(example, id).toBeDefined();
      for (const l of LOCALES) expect(example!.text[l].answer).not.toMatch(/[$€₡]|\b(usd|dollars?|dólares)\b/i);
    }
  });

  it("is long enough for the prompt cache to apply", () => {
    expect(KNOWLEDGE.length).toBeGreaterThanOrEqual(MIN_KNOWLEDGE_CHARS);
  });

  it("presents cybersecurity as something Luis is learning, not a service", () => {
    const can = KNOWLEDGE.toLowerCase();
    expect(can).toContain("learning cybersecurity");
    expect(can).not.toMatch(/offer[s]? (security|penetration)/);
  });
});
