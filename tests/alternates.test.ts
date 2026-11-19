import { describe, expect, it } from "vitest";
import { buildAlternates, localizedUrl } from "@/seo/alternates";

describe("localizedUrl", () => {
  it("builds the locale root without a trailing slash", () => {
    expect(localizedUrl("es", "/")).toBe("https://example.test/es");
  });

  it("joins nested paths", () => {
    expect(localizedUrl("en", "/projects")).toBe(
      "https://example.test/en/projects",
    );
  });

  it("rejects paths that do not start with a slash", () => {
    expect(() => localizedUrl("en", "projects")).toThrow(/must start with/);
  });
});

describe("buildAlternates", () => {
  it("sets canonical to the current locale and lists every hreflang", () => {
    expect(buildAlternates("es", "/projects")).toEqual({
      canonical: "https://example.test/es/projects",
      languages: {
        en: "https://example.test/en/projects",
        es: "https://example.test/es/projects",
        "x-default": "https://example.test/en/projects",
      },
    });
  });
});
