"use client";

import { useSyncExternalStore } from "react";
import {
  DEFAULT_THEME,
  THEME_COLORS,
  THEME_COLOR_SELECTOR,
  THEME_STORAGE_KEY,
  parseTheme,
  toggleTheme,
} from "@/theme/theme";

interface Props {
  lightLabel: string;
  darkLabel: string;
}

/** The <html data-theme> attribute is the source of truth; the boot script sets it before paint. */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

const readTheme = () => parseTheme(document.documentElement.dataset.theme ?? null);
const serverTheme = () => DEFAULT_THEME;

export function ThemeToggle({ lightLabel, darkLabel }: Props) {
  const theme = useSyncExternalStore(subscribe, readTheme, serverTheme);

  function onClick() {
    const next = toggleTheme(theme);
    document.documentElement.dataset.theme = next;
    document.querySelector<HTMLMetaElement>(THEME_COLOR_SELECTOR)?.setAttribute("content", THEME_COLORS[next]);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Storage can be blocked (private mode); the choice then lasts for this page view only.
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-rule px-3 py-1 text-sm text-muted hover:border-muted hover:text-ink"
    >
      {theme === "dark" ? lightLabel : darkLabel}
    </button>
  );
}
