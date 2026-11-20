"use client";

import type { Locale } from "@/i18n/config";
import type { QuestionAnswer } from "@/twin/types";
import { questionsLeft } from "./chat-state";
import { ChatComposer } from "./ChatComposer";
import { ChatFailureNote } from "./ChatFailureNote";
import { fill, type TwinCopy } from "./copy";
import { useTwinChat } from "./useTwinChat";

interface Props {
  locale: Locale;
  copy: TwinCopy;
  book: string;
  starters: readonly QuestionAnswer[];
}

/** The live AI twin: clearly labeled, with instant starters and a hand-off to booking (research S6, P3, C4). */
export function TwinChat({ locale, copy, book, starters }: Props) {
  const { state, ask, starter } = useTwinChat(locale);
  const streaming = state.status === "streaming";
  const left = questionsLeft(state.messages);
  const asked = new Set(state.messages.filter((m) => m.role === "user").map((m) => m.text));
  const openStarters = starters.filter((s) => !asked.has(s.question));
  // Limits that end the conversation replace the composer with the booking card.
  const ended = left === 0 || (state.failure !== null && state.failure !== "invalid" && state.failure !== "failed");
  const failure = left === 0 && !state.failure ? "conversation-cap" : state.failure;

  return (
    <section id="twin" aria-labelledby="twin-title" className="mt-20 grid max-w-[44rem] scroll-mt-6 gap-6 border-t border-rule pt-12">
      <header className="grid gap-3">
        <h2 id="twin-title" className="text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.1] font-bold tracking-[-0.035em] text-balance text-bright">
          {copy.title}
        </h2>
        <p className="text-[0.9375rem] text-muted">
          <span className="mr-2 inline-block rounded-full border border-rule px-2.5 py-0.5 text-[0.8125rem] font-semibold text-ink">
            {copy.label}
          </span>
          {copy.notice}
        </p>
      </header>

      {state.messages.length > 0 && (
        <ol role="log" aria-live="polite" aria-busy={streaming} className="grid gap-2.5">
          {state.messages.map((m) =>
            m.role === "user" ? (
              <li key={m.id} className="max-w-[34rem] justify-self-end rounded-[14px] rounded-br-[4px] bg-ink px-4 py-3 whitespace-pre-wrap text-ground">
                <span className="sr-only">{copy.you}: </span>
                {m.text}
              </li>
            ) : (
              <li key={m.id} className="max-w-[34rem] rounded-[14px] rounded-bl-[4px] border border-rule bg-surface px-4 py-3 whitespace-pre-wrap">
                <span className="sr-only">{copy.label}: </span>
                {m.text || <span className="text-muted">{copy.writing}</span>}
              </li>
            ),
          )}
        </ol>
      )}

      {failure && <ChatFailureNote failure={failure} copy={copy} book={book} />}

      {!ended && (
        <>
          {openStarters.length > 0 && (
            <div className="grid gap-2.5">
              <p className="text-[0.8125rem] text-muted">{copy.starters}</p>
              <ul className="flex flex-wrap gap-2">
                {openStarters.map((s) => (
                  <li key={s.question}>
                    <button
                      type="button"
                      disabled={streaming}
                      onClick={() => starter(s)}
                      className="rounded-full border border-rule bg-raised px-3.5 py-1.5 text-left font-semibold hover:border-muted disabled:opacity-40"
                    >
                      {s.question}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <ChatComposer copy={copy} busy={streaming} onSend={ask} />
          <p className="text-[0.8125rem] text-muted">{fill(copy.left, { count: left })}</p>
        </>
      )}
    </section>
  );
}
