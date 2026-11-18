import type { Locale } from "@/config/site";
import de, { type Dictionary } from "./dictionaries/de";
import en from "./dictionaries/en";
import pt from "./dictionaries/pt";

export type { Dictionary };

const dictionaries: Record<Locale, Dictionary> = { de, en, pt };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

/** Ersetzt Platzhalter wie {n} in Übersetzungstexten. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(values[k] ?? ""));
}
