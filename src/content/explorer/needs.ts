import type { NeedContent } from "@/explorer/types";

/** The "I need…" picker: client problems in plain words, each mapped to an area. */
export const NEEDS: readonly NeedContent[] = [
  { target: "mobile", label: { en: "a mobile app", es: "una app móvil" } },
  { target: "full-stack", label: { en: "a web product or API", es: "un producto web o una API" } },
  { target: "agentic-ai", label: { en: "an AI agent that does real work", es: "un agente de IA que haga trabajo real" } },
  { target: "data", label: { en: "my data in one place", es: "mis datos en un solo lugar" } },
  { target: "databases", label: { en: "a faster, safer database", es: "una base de datos más rápida y segura" } },
  { target: "all", label: { en: "someone to own all of it", es: "alguien que se encargue de todo" } },
];
