/** Zentrale Website-Konfiguration. Name und URL lassen sich per Umgebungsvariable setzen. */
export const site = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "Exklusive Immobilien",
  tagline: "Investmentportal",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
};

export const locales = ["de", "en", "pt"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "de";

export const isLocale = (v: string): v is Locale => (locales as readonly string[]).includes(v);

/** BCP-47-Tags für Zahlen- und Datumsformatierung */
export const intlLocale: Record<Locale, string> = { de: "de-DE", en: "en-GB", pt: "pt-PT" };
