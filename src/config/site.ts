/** Zentrale Website-Konfiguration. Name und URL lassen sich per Umgebungsvariable setzen. */
export const site = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "Objektübersicht",
  /** Zweite Zeile im Logo */
  tagline: "Exklusive Immobilien",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
};

/** Kontaktdaten des Betreibers – erscheinen auf Kontaktseite, im Fußbereich, Impressum und Datenschutz. */
export const contact = {
  company: "LOC-IN",
  descriptor: "Strategic Location & Project Development Consulting",
  street: "Robert-Bosch-Straße 7",
  city: "64293 Darmstadt",
  country: "Deutschland",
  email: "np@loc-in.com",
  taxNumber: "007 874 08683",
};

export const locales = ["de", "en", "pt"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "de";

export const isLocale = (v: string): v is Locale => (locales as readonly string[]).includes(v);

/** BCP-47-Tags für Zahlen- und Datumsformatierung */
export const intlLocale: Record<Locale, string> = { de: "de-DE", en: "en-GB", pt: "pt-PT" };
