"use client";

import { useCallback, useSyncExternalStore } from "react";
import { parseSelection } from "@/explorer/model";
import { ALL_AREAS, type AreaId, type Selection } from "@/explorer/types";

/** The server renders the overview; the client then follows the URL hash (#data, #all…). */
export const DEFAULT_SELECTION: Selection = ALL_AREAS;

const listeners = new Set<() => void>();
let current: Selection | null = null; // read lazily on the client, never at import time

function emit() {
  for (const listener of listeners) listener();
}

/**
 * The selected area, shared with the URL hash so a view can be linked.
 * Unknown hashes (like #contact) leave the selection alone.
 */
export function useSelection(areaIds: readonly AreaId[]): [Selection, (next: Selection) => void] {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const onHash = () => {
        const next = parseSelection(window.location.hash, areaIds);
        if (next !== null && next !== current) {
          current = next;
          emit();
        }
      };
      // Re-read on mount: `current` outlives client navigation (e.g. the
      // language switch), but the new page's URL is the truth.
      const fromUrl = parseSelection(window.location.hash, areaIds) ?? DEFAULT_SELECTION;
      if (fromUrl !== current) {
        current = fromUrl;
        onChange();
      }
      listeners.add(onChange);
      window.addEventListener("hashchange", onHash);
      return () => {
        listeners.delete(onChange);
        window.removeEventListener("hashchange", onHash);
      };
    },
    [areaIds],
  );

  const getSnapshot = useCallback(() => {
    current ??= parseSelection(window.location.hash, areaIds) ?? DEFAULT_SELECTION;
    return current;
  }, [areaIds]);

  const selection = useSyncExternalStore(subscribe, getSnapshot, () => DEFAULT_SELECTION);

  const select = useCallback((next: Selection) => {
    current = next;
    // replaceState: shareable URL without a history entry per click or a scroll jump.
    window.history.replaceState(null, "", `#${next}`);
    emit();
  }, []);

  return [selection, select];
}
