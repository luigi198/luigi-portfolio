/**
 * Informal "tú" pronouns and verb forms. Costa Rican clients expect "usted",
 * so site copy and the AI twin's Spanish answers must never use these.
 */
const TU_FORMS = [
  "tú", "tu", "tus", "ti", "te", "contigo",
  "eres", "estás", "tienes", "puedes", "quieres", "necesitas", "haces", "has",
  "usas", "trabajas", "cobras", "disfrutas", "abordas", "manejas", "empiezas", "resolviste",
  "escribes", "buscas", "tomes", "vas",
  "cuéntame", "pregúntale", "elige", "contratarte", "guiarte",
];
const LETTER = "a-záéíóúüñ";
/** Whole-word match with Spanish letters, so "tú" and "tus" match but "estudio" doesn't. */
const TU = new RegExp(`(^|[^${LETTER}])(${TU_FORMS.join("|")})(?=[^${LETTER}]|$)`, "i");

/** The first informal form in the text, if any. */
export function findTuForm(text: string): string | undefined {
  return TU.exec(text)?.[2];
}
