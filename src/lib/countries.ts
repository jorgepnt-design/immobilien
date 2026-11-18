import { intlLocale, type Locale } from "@/config/site";

/** Ländername aus ISO-Code in der gewählten Sprache (z. B. DE → Deutschland). */
export function countryName(code: string, locale: Locale): string {
  try {
    return new Intl.DisplayNames([intlLocale[locale]], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}
