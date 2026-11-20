"use client";

import { useState } from "react";
import type { TwinExchange } from "@/explorer/types";

interface Props {
  exchange: TwinExchange;
  askLabel: string;
  hideLabel: string;
  note: string;
}

/** Static sample exchange until the live AI twin is built. */
export function TwinPreview({ exchange, askLabel, hideLabel, note }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-10 max-w-[44rem]">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`rounded-full border border-rule px-5 py-2.5 font-semibold hover:border-muted ${open ? "text-muted" : "bg-raised"}`}
      >
        {open ? hideLabel : askLabel}
      </button>
      {open && (
        <div className="mt-4 grid gap-2.5">
          <p className="max-w-[34rem] justify-self-end rounded-[14px] rounded-br-[4px] bg-ink px-4 py-3 text-ground">
            {exchange.question}
          </p>
          <p className="max-w-[34rem] rounded-[14px] rounded-bl-[4px] border border-rule bg-surface px-4 py-3">
            {exchange.answer}
          </p>
          <p className="text-[0.8125rem] text-muted">{note}</p>
        </div>
      )}
    </div>
  );
}
