import { EXAMPLES } from "@/content/twin/examples";
import { STARTER_IDS } from "@/content/twin/starters";
import type { Locale } from "@/i18n/config";
import type { QuestionAnswer } from "@/twin/types";

/** The suggested questions with their prewritten answers, for one locale (research C4). */
export function localizeStarters(locale: Locale): QuestionAnswer[] {
  const byId = new Map(EXAMPLES.map((e) => [e.id, e]));
  return STARTER_IDS.map((id) => {
    const example = byId.get(id);
    if (!example) throw new Error(`Starter "${id}" has no example in examples.ts`);
    return example.text[locale];
  });
}
