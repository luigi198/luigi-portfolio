import { isRelevant, layerRows } from "@/explorer/model";
import { ALL_AREAS, type Area, type AreaId, type Project, type Selection } from "@/explorer/types";
import { areaColor } from "./format";

/** Height of one layer band. */
const BAND_REM = 3.25;
/** Dots and line ends sit on a band's vertical center. */
const BAND_CENTER = 0.5;
/** Project columns sit centered in equal-width slots. */
const COLUMN_CENTER = 0.5;
const DOT_RING = "0 0 0 3px var(--ground)";
const SELECTED_DOT_RING = `${DOT_RING}, 0 0 0 5px var(--ink)`;
const DIMMED = "opacity-30";
/** A dimmed dot comes back while its column is hovered or focused, so the project can be previewed. */
const DIMMED_DOT = `${DIMMED} group-hover:opacity-100 group-focus-visible:opacity-100`;
const bands = (n: number) => `${n * BAND_REM}rem`;

interface Props {
  areas: readonly Area[];
  /** Already in display order (most areas first). */
  projects: readonly Project[];
  selection: Selection;
  projectId: string | null;
  label: string;
  onArea: (id: AreaId) => void;
  onProject: (id: string) => void;
  onHover: (id: string | null) => void;
}

/** Layers stacked top to bottom; each project is a column with a dot on every layer it used. */
export function LayerMap({ areas, projects, selection, projectId, label, onArea, onProject, onHover }: Props) {
  const layerOrder = areas.map((a) => a.id);
  const showAll = selection === ALL_AREAS;
  const isOn = (id: AreaId) => showAll || id === selection;
  const isDim = (p: Project) => !isRelevant(p, selection) && p.id !== projectId;
  // A dot is lit when its own layer is selected, or when its project is open.
  const isLit = (p: Project, id: AreaId) => p.id === projectId || isOn(id);

  return (
    <div className="-mx-1 overflow-x-auto p-1">
      <div role="group" aria-label={label} className="grid min-w-[40rem] grid-cols-[11rem_1fr]">
        <div className="grid" style={{ gridTemplateRows: `repeat(${areas.length}, ${BAND_REM}rem)` }}>
          {areas.map((a) => (
            <button
              key={a.id}
              type="button"
              aria-pressed={!showAll && a.id === selection}
              onClick={() => onArea(a.id)}
              className={`flex items-center gap-2.5 pr-3 text-left transition-colors hover:text-ink ${isOn(a.id) ? "font-bold text-ink" : "font-medium text-muted"}`}
            >
              <i className="size-2.5 shrink-0 rounded-full" style={{ background: areaColor(a.id) }} />
              {a.name}
            </button>
          ))}
        </div>

        <div className="relative border-x border-rule" style={{ height: bands(areas.length) }}>
          {areas.map((a, i) => (
            <div
              key={a.id}
              className="absolute inset-x-0 border-t border-rule transition-colors last-of-type:border-b"
              style={{
                top: bands(i),
                height: bands(1),
                background: isOn(a.id) ? `color-mix(in srgb, ${areaColor(a.id)} var(--tint), transparent)` : undefined,
              }}
            />
          ))}
          {projects.map((p, k) => {
            const rows = layerRows(p, layerOrder); // throws on bad content, failing the build
            const top = Math.min(...rows);
            const selected = p.id === projectId;
            return (
              <button
                key={p.id}
                type="button"
                data-column={p.id}
                aria-label={p.title}
                aria-pressed={selected}
                onClick={() => onProject(p.id)}
                onMouseEnter={() => onHover(p.id)}
                onMouseLeave={() => onHover(null)}
                onFocus={() => onHover(p.id)}
                onBlur={() => onHover(null)}
                className="map-column group absolute w-8 -translate-x-1/2"
                style={{ left: `${((k + COLUMN_CENTER) / projects.length) * 100}%`, top: bands(top), height: bands(Math.max(...rows) - top + 1) }}
              >
                <span
                  className={`absolute left-1/2 -translate-x-1/2 transition-all ${selected ? "w-[3px] bg-ink" : `w-0.5 bg-muted ${isDim(p) ? "opacity-15" : "opacity-50"} group-hover:opacity-100 group-focus-visible:opacity-100`}`}
                  style={{ top: bands(BAND_CENTER), bottom: bands(BAND_CENTER) }}
                />
                {p.areas.map((id, i) => (
                  <span
                    key={id}
                    data-dot={`${p.id}:${id}`}
                    data-lit={isLit(p, id)}
                    className={`map-dot absolute left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all ${selected ? "size-[1.1rem]" : "size-3.5"} ${isLit(p, id) ? "" : DIMMED_DOT}`}
                    style={{
                      top: bands(rows[i] - top + BAND_CENTER),
                      color: areaColor(id),
                      background: "currentColor",
                      boxShadow: selected ? SELECTED_DOT_RING : DOT_RING,
                    }}
                  />
                ))}
              </button>
            );
          })}
        </div>

        <div className="col-start-2 grid pt-2.5" style={{ gridTemplateColumns: `repeat(${projects.length}, minmax(0, 1fr))` }}>
          {projects.map((p) => (
            <button
              key={p.id}
              type="button"
              tabIndex={-1}
              onClick={() => onProject(p.id)}
              className={`px-1 text-center text-[0.8125rem] leading-snug text-balance transition-opacity hover:text-ink ${p.id === projectId ? "font-semibold text-ink" : "text-muted"} ${isDim(p) ? DIMMED : ""}`}
            >
              {p.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
