"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import type { Locale } from "@/i18n/config";
import { TWIN_API_PATH } from "@/twin/route-path";
import type { QuestionAnswer } from "@/twin/types";
import { chatReducer, historyOf, initialChat } from "./chat-state";
import { failureFrom, readChunks } from "./stream";

/** Chat state plus the two ways to add an exchange: ask the API, or serve a starter instantly. */
export function useTwinChat(locale: Locale) {
  const [state, dispatch] = useReducer(chatReducer, initialChat);
  const controllerRef = useRef<AbortController | null>(null);

  // Stop reading an answer if the visitor leaves the page mid-stream.
  useEffect(() => () => controllerRef.current?.abort(), []);

  const ask = useCallback(
    async (text: string) => {
      if (state.status === "streaming") return;
      const history = historyOf(state.messages);
      dispatch({ type: "ask", text });
      const controller = new AbortController();
      controllerRef.current = controller;
      try {
        const response = await fetch(TWIN_API_PATH, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ locale, history, message: text }),
          signal: controller.signal,
        });
        if (!response.ok || !response.body) {
          dispatch({ type: "fail", failure: failureFrom(await response.json().catch(() => null)) });
          return;
        }
        for await (const chunk of readChunks(response.body)) {
          if (chunk.type === "error") {
            dispatch({ type: "fail", failure: "failed" });
            return;
          }
          dispatch({ type: "chunk", chunk });
        }
        dispatch({ type: "finish" });
      } catch {
        if (!controller.signal.aborted) dispatch({ type: "fail", failure: "failed" });
      }
    },
    [locale, state.messages, state.status],
  );

  const starter = useCallback((qa: QuestionAnswer) => {
    dispatch({ type: "starter", question: qa.question, answer: qa.answer });
  }, []);

  return { state, ask, starter };
}
