import type { Need, Selection } from "@/explorer/types";

interface Props {
  label: string;
  needs: readonly Need[];
  /** The need to show as chosen; null while a project is open. */
  active: Selection | null;
  onPick: (target: Selection) => void;
}

/** Lets a client start from their problem instead of a job title. */
export function NeedPicker({ label, needs, active, onPick }: Props) {
  return (
    <fieldset className="mb-8 flex flex-wrap items-center gap-2">
      <legend className="float-left mr-2 text-[1.0625rem] font-semibold">{label}</legend>
      {needs.map((n) => {
        const on = n.target === active;
        return (
          <button
            key={n.target}
            type="button"
            aria-pressed={on}
            onClick={() => onPick(n.target)}
            className={`rounded-full border px-3.5 py-1.5 text-[0.9375rem] transition-colors ${on ? "border-ink bg-ink text-ground" : "border-rule bg-surface hover:border-muted"}`}
          >
            {n.label}
          </button>
        );
      })}
    </fieldset>
  );
}
