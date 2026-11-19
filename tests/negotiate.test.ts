import { describe, expect, it } from "vitest";
import { negotiateLocale } from "@/i18n/negotiate";

describe("negotiateLocale", () => {
  it("picks Spanish for a regional Spanish header", () => {
    expect(negotiateLocale("es-MX,es;q=0.9,en;q=0.8")).toBe("es");
  });

  it("respects q-values over header order", () => {
    expect(negotiateLocale("en;q=0.5,es;q=0.9")).toBe("es");
  });

  it("picks English when English ranks highest", () => {
    expect(negotiateLocale("en-GB,en;q=0.9,es;q=0.4")).toBe("en");
  });

  it("falls back to the default for unsupported languages", () => {
    expect(negotiateLocale("fr-FR,de;q=0.8")).toBe("en");
  });

  it("falls back to the default for a missing header", () => {
    expect(negotiateLocale(null)).toBe("en");
  });

  it("ignores malformed and q=0 entries", () => {
    expect(negotiateLocale(";;,es;q=0,garbage;q=abc")).toBe("en");
  });
});
