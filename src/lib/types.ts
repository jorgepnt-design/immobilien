/**
 * Datenmodell der Plattform.
 * Jede Immobilie liegt als eigene JSON-Datei in /data/properties.
 */

export const PROPERTY_TYPES = [
  "einfamilienhaus",
  "mehrfamilienhaus",
  "wohnanlage",
  "grundstueck",
  "buero",
  "hotel",
  "einzelhandel",
  "logistik",
  "industrie",
  "gewerbe",
  "mischobjekt",
  "entwicklungsprojekt",
  "freizeit",
] as const;
export type PropertyType = (typeof PROPERTY_TYPES)[number];

export const INVESTMENT_TYPES = [
  "bestand",
  "neubau",
  "sanierung",
  "projektentwicklung",
] as const;
export type InvestmentType = (typeof INVESTMENT_TYPES)[number];

export const STATUSES = ["verfuegbar", "reserviert", "verkauft"] as const;
export type Status = (typeof STATUSES)[number];

/** Belegqualität einer Angabe. */
export type Evidence = "fakt" | "anbieter" | "potenzial" | "annahme" | "berechnet";

export type RentalStatus =
  | "vermietet"
  | "teilvermietet"
  | "leerstand"
  | "frei"
  | "betrieb"
  | "entfaellt"
  | "nicht-angegeben";

export type PriceMode = "festpreis" | "auf-anfrage" | "gebotsverfahren";

export interface Fact {
  label: string;
  value: string;
  evidence: Evidence;
  note?: string;
}

export interface AreaValue {
  /** Fläche in m² */
  value: number;
  approx?: boolean;
  planned?: boolean;
  note?: string;
}

export interface PropertyImage {
  src: string;
  width: number;
  height: number;
  alt: string;
  kind: "foto" | "plan";
}

export interface Property {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  teaser: string;
  status: Status;
  /** Datum der Aufnahme in die Plattform (ISO) */
  listedAt: string;
  location: {
    /** ISO-3166-Ländercode, z. B. DE, PT */
    country: string;
    region: string;
    city: string;
    district?: string;
    /** Nur wenn true, wird `address` öffentlich angezeigt. */
    addressPublic: boolean;
    address?: string;
    /** Ungefähre Kartenmitte (Makrolage, nicht die Objektadresse) */
    mapCenter?: { lat: number; lng: number; zoom: number };
    description: string[];
    connections?: { label: string; value: string }[];
  };
  type: PropertyType;
  investmentType: InvestmentType;
  price: {
    amount: number | null;
    currency: string;
    mode: PriceMode;
    note?: string;
  };
  areas: {
    plot?: AreaValue;
    living?: AreaValue;
    usable?: AreaValue;
    commercial?: AreaValue;
    gfa?: AreaValue;
  };
  units?: { count: number; label: string; note?: string } | null;
  yearBuilt?: string | null;
  condition?: string | null;
  rental: {
    status: RentalStatus;
    text: string;
    annualNetRent?: number;
    rentNote?: string;
  };
  yield?: {
    percent: number;
    label: string;
    formula: string;
    basis: string;
    caveat: string;
  };
  keyFacts: Fact[];
  description: string[];
  highlights: string[];
  potential: { title: string; text: string; evidence: Evidence }[];
  areaTable?: {
    title?: string;
    rows: { name: string; use?: string; area: string }[];
    note?: string;
  };
  planning?: Fact[];
  energy?: Fact[];
  economics?: Fact[];
  /** Widersprüche, offene Punkte und fehlende Angaben */
  dataNotes: string[];
  images: PropertyImage[];
  /** Pfad zu einem freigegebenen Exposé in /public oder null */
  exposeDownload?: string | null;
  source: string;
}

/** Schlanke Fassung für Listen, Filter, Merkliste und Vergleich. */
export interface PropertySummary {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  teaser: string;
  status: Status;
  listedAt: string;
  country: string;
  region: string;
  city: string;
  district?: string;
  type: PropertyType;
  investmentType: InvestmentType;
  price: Property["price"];
  plotArea?: AreaValue;
  /** Wohn-/Nutzfläche: Nutzfläche, sonst Wohnfläche, sonst Gewerbefläche */
  mainArea?: AreaValue & { kind: "usable" | "living" | "commercial" };
  livingArea?: AreaValue;
  usableArea?: AreaValue;
  units?: { count: number; label: string } | null;
  rentalStatus: RentalStatus;
  rentalText: string;
  yieldPercent?: number;
  yieldLabel?: string;
  potentialTitles: string[];
  cover?: PropertyImage;
  searchText: string;
}
