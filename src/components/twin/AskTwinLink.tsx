"use client";

import { TWIN_INPUT_ID } from "./ids";

/**
 * Jumps to the chat. On devices with a mouse it also focuses the message box;
 * on touch screens it doesn't, so the keyboard doesn't cover the starters.
 */
export function AskTwinLink({ label }: { label: string }) {
  const focusInput = () => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    document.getElementById(TWIN_INPUT_ID)?.focus({ preventScroll: true });
  };

  return (
    <a
      href="#twin"
      onClick={focusInput}
      className="inline-block rounded-full border border-rule bg-raised px-4 py-2 font-semibold text-ink hover:border-muted"
    >
      {label}
    </a>
  );
}
