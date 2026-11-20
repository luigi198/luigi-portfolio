export const THEMES = ["dark", "light"] as const;
export type Theme = (typeof THEMES)[number];

/** Dark is the brand; light is opt-in through the toggle, not the OS setting. */
export const DEFAULT_THEME: Theme = "dark";
export const THEME_STORAGE_KEY = "theme";

const THEME_SET: ReadonlySet<string> = new Set(THEMES);

function isTheme(value: string | null): value is Theme {
  return value !== null && THEME_SET.has(value);
}

export function parseTheme(value: string | null): Theme {
  return isTheme(value) ? value : DEFAULT_THEME;
}

export function toggleTheme(theme: Theme): Theme {
  return theme === "dark" ? "light" : "dark";
}

/** Page ground per theme, also used for the mobile browser bar (<meta name="theme-color">). */
export const THEME_COLORS: Record<Theme, string> = { dark: "#0a0b0d", light: "#f4f5f6" };
export const THEME_COLOR_SELECTOR = 'meta[name="theme-color"]';

/**
 * Inline script rendered as a plain <script> in <head>, so it runs before first
 * paint and a saved light choice never flashes dark. Mirrors parseTheme;
 * storage can throw when blocked.
 */
export const THEME_BOOT_SCRIPT = `(function(){var c=${JSON.stringify(THEME_COLORS)},t=null;try{t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)})}catch(e){}if(!Object.prototype.hasOwnProperty.call(c,t))t=${JSON.stringify(DEFAULT_THEME)};document.documentElement.dataset.theme=t;var m=document.querySelector(${JSON.stringify(THEME_COLOR_SELECTOR)});if(m)m.content=c[t]})()`;
