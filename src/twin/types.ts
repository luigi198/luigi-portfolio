import type { Locale } from "@/i18n/config";

/** Boundary types between the twin's content (data) and its domain logic. */

export interface QuestionAnswer {
  question: string;
  answer: string;
}

/** One answer in Luis's own words, in every locale. Few-shot example for the model. */
export interface TwinExample {
  id: string;
  text: Record<Locale, QuestionAnswer>;
}

/** Fixed lines the twin uses instead of improvising. */
export interface TwinReplies {
  /** Off-topic, abusive or instruction-override messages, and model refusals. */
  redirect: Record<Locale, string>;
}
