"use client";

import { useId, useState, type FormEvent, type KeyboardEvent } from "react";
import { MAX_MESSAGE_CHARS } from "@/twin/policy";
import type { TwinCopy } from "./copy";
import { TWIN_INPUT_ID } from "./ids";

interface Props {
  copy: TwinCopy;
  busy: boolean;
  onSend: (text: string) => void;
}

/** Message box with a live character count, capped at the server's limit (research A3). */
export function ChatComposer({ copy, busy, onSend }: Props) {
  const [text, setText] = useState("");
  const countId = useId();
  const canSend = !busy && text.trim().length > 0;

  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    if (!canSend) return;
    onSend(text.trim());
    setText("");
  };

  // Enter sends; Shift+Enter adds a line, as in most chat apps.
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) submit(event);
  };

  return (
    <form onSubmit={submit} className="grid gap-2">
      <label htmlFor={TWIN_INPUT_ID} className="sr-only">
        {copy.placeholder}
      </label>
      <textarea
        id={TWIN_INPUT_ID}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
        maxLength={MAX_MESSAGE_CHARS}
        rows={2}
        placeholder={copy.placeholder}
        aria-describedby={countId}
        className="w-full resize-y rounded-[14px] border border-rule bg-surface px-4 py-3 placeholder:text-muted"
      />
      <div className="flex items-center justify-between gap-4">
        <span id={countId} className="text-[0.8125rem] text-muted tabular-nums">
          {text.length}/{MAX_MESSAGE_CHARS}
        </span>
        <button
          type="submit"
          disabled={!canSend}
          className="rounded-full bg-cta px-5 py-2 font-semibold text-cta-ink disabled:opacity-40"
        >
          {copy.send}
        </button>
      </div>
    </form>
  );
}
