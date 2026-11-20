import { describe, expect, it } from "vitest";
import { DEFAULT_THEME, THEME_BOOT_SCRIPT, THEME_COLORS, THEME_STORAGE_KEY, parseTheme, toggleTheme } from "@/theme/theme";

describe("parseTheme", () => {
  it("defaults to dark", () => {
    expect(DEFAULT_THEME).toBe("dark");
    expect(parseTheme(null)).toBe("dark");
  });

  it("accepts a stored light choice", () => {
    expect(parseTheme("light")).toBe("light");
  });

  it("ignores unknown stored values", () => {
    expect(parseTheme("sepia")).toBe("dark");
  });
});

describe("toggleTheme", () => {
  it("flips between dark and light", () => {
    expect(toggleTheme("dark")).toBe("light");
    expect(toggleTheme("light")).toBe("dark");
  });
});

/** Runs the pre-paint script against a fake document and storage. */
function boot(storage: { getItem(key: string): string | null }) {
  const root = { dataset: {} as Record<string, string> };
  const meta = { content: "" };
  const document = { documentElement: root, querySelector: () => meta };
  new Function("document", "localStorage", THEME_BOOT_SCRIPT)(document, storage);
  return { theme: root.dataset.theme, barColor: meta.content };
}

describe("THEME_BOOT_SCRIPT", () => {
  it("applies the saved theme before the page paints", () => {
    expect(boot({ getItem: (k) => (k === THEME_STORAGE_KEY ? "light" : null) }).theme).toBe("light");
  });

  it("falls back to dark when nothing is saved", () => {
    expect(boot({ getItem: () => null }).theme).toBe("dark");
  });

  it("falls back to dark when storage throws", () => {
    expect(boot({ getItem: () => { throw new Error("blocked"); } }).theme).toBe("dark");
  });

  it("matches the mobile browser bar to the saved theme", () => {
    expect(boot({ getItem: () => "light" }).barColor).toBe(THEME_COLORS.light);
    expect(boot({ getItem: () => null }).barColor).toBe(THEME_COLORS.dark);
  });
});
