import { describe, expect, it } from "vitest";
import { buildSystemPrompt } from "@/twin/prompt";
import { KNOWLEDGE } from "@/content/twin/knowledge";
import { EXAMPLES } from "@/content/twin/examples";
import { REPLIES } from "@/content/twin/replies";
import { LOCALES } from "@/i18n/config";

describe("buildSystemPrompt", () => {
  const prompt = buildSystemPrompt();

  it("is byte-identical on every build, so the prompt cache hits", () => {
    expect(buildSystemPrompt()).toBe(prompt);
  });

  it("holds no timestamps or other per-request data", () => {
    expect(prompt).not.toMatch(/\d{4}-\d{2}-\d{2}|\d{1,2}:\d{2}/);
  });

  it("includes the knowledge file and every example answer in both languages", () => {
    expect(prompt).toContain(KNOWLEDGE);
    for (const e of EXAMPLES) for (const l of LOCALES) expect(prompt).toContain(e.text[l].answer);
  });

  it("gives the fixed redirect line word for word in both languages", () => {
    for (const l of LOCALES) expect(prompt).toContain(REPLIES.redirect[l]);
  });

  it("states the rules the twin must follow", () => {
    const rules = prompt.toLowerCase();
    for (const rule of ["usted", "never quote", "dates", "ai version", "only facts", "untrusted"]) {
      expect(rules, rule).toContain(rule);
    }
  });
});
