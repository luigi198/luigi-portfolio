"use client";

import { useState } from "react";
import type { TwinExchange } from "@/explorer/types";

interface Props {
  exchange: TwinExchange;
  askLabel: string;
  hideLabel: string;
  note: string;
  /** Link text to the live chat section. */
  chatLabel: string;
}

/** One prewritten exchange per area, shown instantly at no cost, with a link to the live chat. */
export function TwinPreview({
  exchange,
  askLabel,
  hideLabel,
  note,
  chatLabel,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-10 max-w-[44rem]">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className={`rounded-full border border-rule px-5 py-2.5 font-semibold hover:border-muted ${open ? "text-muted" : "bg-raised"}`}
        >
          {open ? hideLabel : askLabel}
        </button>
        <a
          href="#twin"
          className="font-semibold underline decoration-rule decoration-2 underline-offset-[3px] hover:decoration-muted"
        >
          {chatLabel}
        </a>
      </div>
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
