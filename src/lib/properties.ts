import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { Property, PropertySummary } from "./types";

const DATA_DIR = path.join(process.cwd(), "data", "properties");

let cache: Property[] | null = null;

/** Lädt alle Objekte aus /data/properties (eine JSON-Datei pro Objekt). */
export function getAllProperties(): Property[] {
  if (cache && process.env.NODE_ENV === "production") return cache;
  if (!fs.existsSync(DATA_DIR)) return [];
  const items = fs
    .readdirSync(DATA_DIR)
    .filter((f) => f.endsWith(".json") && !f.startsWith("_"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), "utf8")) as Property)
    .sort((a, b) => a.id.localeCompare(b.id));

  const ids = new Set<string>();
  const slugs = new Set<string>();
  for (const p of items) {
    if (ids.has(p.id)) throw new Error(`Doppelte Objekt-ID: ${p.id}`);
    if (slugs.has(p.slug)) throw new Error(`Doppelter Slug: ${p.slug}`);
    ids.add(p.id);
    slugs.add(p.slug);
  }
  cache = items;
  return items;
}

export function getProperty(slug: string): Property | undefined {
  return getAllProperties().find((p) => p.slug === slug);
}

export function toSummary(p: Property): PropertySummary {
  const { usable, living, commercial, plot } = p.areas;
  const mainArea = usable
    ? { ...usable, kind: "usable" as const }
    : living
      ? { ...living, kind: "living" as const }
      : commercial
        ? { ...commercial, kind: "commercial" as const }
        : undefined;

  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    subtitle: p.subtitle,
    teaser: p.teaser,
    status: p.status,
    listedAt: p.listedAt,
    country: p.location.country,
    region: p.location.region,
    city: p.location.city,
    district: p.location.district,
    type: p.type,
    investmentType: p.investmentType,
    price: p.price,
    plotArea: plot,
    mainArea,
    livingArea: living,
    usableArea: usable,
    units: p.units ? { count: p.units.count, label: p.units.label } : null,
    rentalStatus: p.rental.status,
    rentalText: p.rental.text,
    yieldPercent: p.yield?.percent,
    yieldLabel: p.yield?.label,
    potentialTitles: p.potential.map((x) => x.title),
    cover: p.images.find((i) => i.kind === "foto") ?? p.images[0],
    searchText: [
      p.id,
      p.title,
      p.subtitle,
      p.teaser,
      p.location.city,
      p.location.district,
      p.location.region,
      ...p.highlights,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase(),
  };
}

export function getAllSummaries(): PropertySummary[] {
  return getAllProperties().map(toSummary);
}

export interface PortfolioStats {
  count: number;
  countries: number;
  locations: number;
  /** Summe aller bekannten Kaufpreise in EUR */
  volume: number;
  pricedCount: number;
}

/** Kennzahlen werden ausschließlich aus dem tatsächlichen Portfolio berechnet. */
export function getPortfolioStats(): PortfolioStats {
  const all = getAllProperties().filter((p) => p.status !== "verkauft");
  const priced = all.filter((p) => p.price.amount !== null && p.price.currency === "EUR");
  return {
    count: all.length,
    countries: new Set(all.map((p) => p.location.country)).size,
    locations: new Set(all.map((p) => `${p.location.country}|${p.location.city}`)).size,
    volume: priced.reduce((s, p) => s + (p.price.amount ?? 0), 0),
    pricedCount: priced.length,
  };
}

/** Ähnliche Objekte: gleiche Objektart, gleiches Land, gleiche Investmentart. */
export function getSimilar(p: Property, max = 3): PropertySummary[] {
  return getAllProperties()
    .filter((o) => o.id !== p.id && o.status !== "verkauft")
    .map((o) => ({
      o,
      score:
        (o.type === p.type ? 3 : 0) +
        (o.location.country === p.location.country ? 2 : 0) +
        (o.location.region === p.location.region ? 1 : 0) +
        (o.investmentType === p.investmentType ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score || a.o.id.localeCompare(b.o.id))
    .slice(0, max)
    .map((x) => toSummary(x.o));
}
