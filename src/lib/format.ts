import { intlLocale, type Locale } from "@/config/site";
import type { AreaValue, Property } from "./types";
import type { Dictionary } from "./i18n/dictionary";

export function formatCurrency(amount: number, currency: string, locale: Locale): string {
  return new Intl.NumberFormat(intlLocale[locale], {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Kompakte Summe, z. B. „6,33 Mio. €“ */
export function formatVolume(amount: number, locale: Locale): string {
  return new Intl.NumberFormat(intlLocale[locale], {
    style: "currency",
    currency: "EUR",
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPrice(price: Property["price"], locale: Locale, t: Dictionary): string {
  if (price.amount !== null) return formatCurrency(price.amount, price.currency, locale);
  return price.mode === "gebotsverfahren" ? t.price.bidding : t.price.onRequest;
}

export function formatNumber(n: number, locale: Locale, digits = 0): string {
  return new Intl.NumberFormat(intlLocale[locale], {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(n);
}

/** Flächen ab 10 ha werden in Hektar ausgegeben. */
export function formatArea(area: AreaValue | undefined, locale: Locale, t: Dictionary): string {
  if (!area) return t.common.notSpecified;
  const prefix = area.approx ? `${t.common.approx} ` : "";
  if (area.value >= 100000) {
    return `${prefix}${formatNumber(area.value / 10000, locale, area.value % 10000 === 0 ? 0 : 1)} ha`;
  }
  return `${prefix}${formatNumber(area.value, locale)} m²`;
}

export function formatPercent(n: number, locale: Locale): string {
  return `${formatNumber(n, locale, 2)} %`;
}

export function locationLine(p: { city: string; district?: string }): string {
  return p.district ? `${p.city} – ${p.district}` : p.city;
}
