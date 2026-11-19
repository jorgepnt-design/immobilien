"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
import {
  INVESTMENT_TYPES,
  STATUSES,
  type InvestmentType,
  type PropertySummary,
  type PropertyType,
  type Status,
} from "@/lib/types";
import { countryName } from "@/lib/countries";
import { fill } from "@/lib/i18n/dictionary";
import { useI18n } from "./providers";
import { PropertyCard } from "./property-card";

interface Filters {
  q: string;
  country: string;
  region: string;
  city: string;
  type: "" | PropertyType;
  investment: "" | InvestmentType;
  status: "" | Status;
  priceMin: string;
  priceMax: string;
  plotMin: string;
  plotMax: string;
  areaMin: string;
  areaMax: string;
}

const EMPTY: Filters = {
  q: "",
  country: "",
  region: "",
  city: "",
  type: "",
  investment: "",
  status: "",
  priceMin: "",
  priceMax: "",
  plotMin: "",
  plotMax: "",
  areaMin: "",
  areaMax: "",
};

/** Kurzformen in der URL, damit Filter verlinkbar sind. */
const PARAMS: Record<keyof Filters, string> = {
  q: "q",
  country: "land",
  region: "region",
  city: "ort",
  type: "typ",
  investment: "investment",
  status: "status",
  priceMin: "preis_von",
  priceMax: "preis_bis",
  plotMin: "grundstueck_von",
  plotMax: "grundstueck_bis",
  areaMin: "flaeche_von",
  areaMax: "flaeche_bis",
};

type Sort = "newest" | "priceAsc" | "priceDesc" | "location" | "area";

const num = (v: string): number | null => {
  const n = Number(v.replace(/[.\s]/g, "").replace(",", "."));
  return v.trim() !== "" && Number.isFinite(n) ? n : null;
};

function inRange(value: number | undefined | null, min: string, max: string): boolean {
  const lo = num(min);
  const hi = num(max);
  if (lo === null && hi === null) return true;
  if (value === undefined || value === null) return false;
  return (lo === null || value >= lo) && (hi === null || value <= hi);
}

function applyFilters(items: PropertySummary[], f: Filters): PropertySummary[] {
  const terms = f.q.toLowerCase().split(/\s+/).filter(Boolean);
  return items.filter(
    (p) =>
      terms.every((term) => p.searchText.includes(term)) &&
      (!f.country || p.country === f.country) &&
      (!f.region || p.region === f.region) &&
      (!f.city || p.city === f.city) &&
      (!f.type || p.type === f.type) &&
      (!f.investment || p.investmentType === f.investment) &&
      (!f.status || p.status === f.status) &&
      inRange(p.price.amount, f.priceMin, f.priceMax) &&
      inRange(p.plotArea?.value, f.plotMin, f.plotMax) &&
      inRange(p.mainArea?.value, f.areaMin, f.areaMax),
  );
}

function sortItems(items: PropertySummary[], sort: Sort, locale: string): PropertySummary[] {
  const nullsLast = (a: number | null | undefined, b: number | null | undefined, dir: 1 | -1) => {
    if (a == null && b == null) return 0;
    if (a == null) return 1;
    if (b == null) return -1;
    return (a - b) * dir;
  };
  const sorted = [...items];
  switch (sort) {
    case "priceAsc":
      return sorted.sort((a, b) => nullsLast(a.price.amount, b.price.amount, 1));
    case "priceDesc":
      return sorted.sort((a, b) => nullsLast(a.price.amount, b.price.amount, -1));
    case "area":
      return sorted.sort((a, b) => nullsLast(a.mainArea?.value, b.mainArea?.value, -1));
    case "location":
      return sorted.sort(
        (a, b) =>
          a.country.localeCompare(b.country) ||
          a.city.localeCompare(b.city, locale) ||
          a.title.localeCompare(b.title, locale),
      );
    default:
      return sorted.sort((a, b) => b.listedAt.localeCompare(a.listedAt) || b.id.localeCompare(a.id));
  }
}

const unique = (values: string[]) => [...new Set(values)].sort((a, b) => a.localeCompare(b));

export function PropertyExplorer({ items }: { items: PropertySummary[] }) {
  const { t, locale } = useI18n();
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [sort, setSort] = useState<Sort>("newest");
  const [drawer, setDrawer] = useState(false);
  const [ready, setReady] = useState(false);

  // Filter aus der URL übernehmen (z. B. von der Suche auf der Startseite)
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const next = { ...EMPTY };
    (Object.keys(PARAMS) as (keyof Filters)[]).forEach((k) => {
      const v = sp.get(PARAMS[k]);
      if (v) (next as Record<string, string>)[k] = v;
    });
    setFilters(next);
    setReady(true);
  }, []);

  // Aktive Filter in die URL schreiben, ohne die Seite neu zu laden
  useEffect(() => {
    if (!ready) return;
    const sp = new URLSearchParams();
    (Object.keys(PARAMS) as (keyof Filters)[]).forEach((k) => {
      if (filters[k]) sp.set(PARAMS[k], filters[k]);
    });
    const qs = sp.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, [filters, ready]);

  useEffect(() => {
    document.body.style.overflow = drawer ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawer]);

  const countries = useMemo(() => unique(items.map((p) => p.country)), [items]);
  const regions = useMemo(
    () => unique(items.filter((p) => !filters.country || p.country === filters.country).map((p) => p.region)),
    [items, filters.country],
  );
  const cities = useMemo(
    () =>
      unique(
        items
          .filter(
            (p) =>
              (!filters.country || p.country === filters.country) &&
              (!filters.region || p.region === filters.region),
          )
          .map((p) => p.city),
      ),
    [items, filters.country, filters.region],
  );
  const types = useMemo(() => unique(items.map((p) => p.type)) as PropertyType[], [items]);

  const results = useMemo(
    () => sortItems(applyFilters(items, filters), sort, locale),
    [items, filters, sort, locale],
  );
  const activeCount = (Object.keys(filters) as (keyof Filters)[]).filter((k) => filters[k]).length;

  const set = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    setFilters((prev) => {
      const next = { ...prev, [key]: value };
      // Abhängige Filter zurücksetzen, wenn die Auswahl nicht mehr passt
      if (key === "country") {
        next.region = "";
        next.city = "";
      }
      if (key === "region") next.city = "";
      return next;
    });

  const select = (
    key: "country" | "region" | "city" | "type" | "investment" | "status",
    label: string,
    options: { value: string; label: string }[],
    idPrefix: string,
  ) => (
    <div>
      <label className="label" htmlFor={`${idPrefix}-${key}`}>
        {label}
      </label>
      <select
        id={`${idPrefix}-${key}`}
        className="field"
        value={filters[key]}
        onChange={(e) => set(key, e.target.value as never)}
      >
        <option value="">{t.filters.all}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );

  const range = (minKey: keyof Filters, maxKey: keyof Filters, label: string, idPrefix: string) => (
    <fieldset>
      <legend className="label">{label}</legend>
      <div className="grid grid-cols-2 gap-2">
        {[minKey, maxKey].map((k, i) => (
          <input
            key={k}
            className="field"
            inputMode="numeric"
            aria-label={`${label} ${i === 0 ? t.filters.from : t.filters.to}`}
            placeholder={i === 0 ? t.filters.from : t.filters.to}
            id={`${idPrefix}-${k}`}
            value={filters[k]}
            onChange={(e) => set(k, e.target.value.replace(/[^\d.,]/g, "") as never)}
          />
        ))}
      </div>
    </fieldset>
  );

  const panel = (idPrefix: string) => (
    <div className="space-y-5">
      <div>
        <label className="label" htmlFor={`${idPrefix}-q`}>
          {t.filters.search}
        </label>
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-warm" />
          <input
            id={`${idPrefix}-q`}
            type="search"
            className="field !pl-9"
            placeholder={t.search.placeholder}
            value={filters.q}
            onChange={(e) => set("q", e.target.value)}
          />
        </div>
      </div>
      {select("country", t.filters.country, countries.map((c) => ({ value: c, label: countryName(c, locale) })), idPrefix)}
      {select("region", t.filters.region, regions.map((r) => ({ value: r, label: r })), idPrefix)}
      {select("city", t.filters.city, cities.map((c) => ({ value: c, label: c })), idPrefix)}
      {select("type", t.filters.type, types.map((v) => ({ value: v, label: t.types[v] })), idPrefix)}
      {range("priceMin", "priceMax", t.filters.price, idPrefix)}
      {(filters.priceMin || filters.priceMax) && (
        <p className="-mt-3 text-xs leading-snug text-stone-warm">{t.filters.priceHint}</p>
      )}
      {range("plotMin", "plotMax", t.filters.plot, idPrefix)}
      {range("areaMin", "areaMax", t.filters.area, idPrefix)}
      {select(
        "investment",
        t.filters.investment,
        INVESTMENT_TYPES.map((v) => ({ value: v, label: t.investmentTypes[v] })),
        idPrefix,
      )}
      {select("status", t.filters.status, STATUSES.map((v) => ({ value: v, label: t.status[v] })), idPrefix)}
      <button
        type="button"
        className="btn btn-outline w-full"
        onClick={() => setFilters(EMPTY)}
        disabled={activeCount === 0}
      >
        <RotateCcw size={15} />
        {t.filters.reset}
      </button>
    </div>
  );

  const resultLabel =
    results.length === 1 ? t.filters.resultsOne : fill(t.filters.resultsMany, { n: results.length });

  return (
    <div className="grid gap-10 lg:grid-cols-[19rem_1fr]">
      <aside className="hidden lg:block">
        <div className="card sticky top-24 border-sky bg-sky/70 max-h-[calc(100vh-7.5rem)] overflow-y-auto p-6">
          <h2 className="heading-display mb-5 flex items-center justify-between text-2xl text-navy-900">
            {t.filters.title}
            {activeCount > 0 && (
              <span className="font-sans text-xs font-semibold tracking-wide text-champagne-dark">
                {fill(t.filters.active, { n: activeCount })}
              </span>
            )}
          </h2>
          {panel("f")}
        </div>
      </aside>

      <div>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm font-medium text-navy-900" role="status" aria-live="polite">
            {resultLabel}
          </p>
          <div className="flex items-center gap-3">
            <button type="button" className="btn btn-outline !min-h-10 !px-4 lg:hidden" onClick={() => setDrawer(true)}>
              <SlidersHorizontal size={15} />
              {t.filters.title}
              {activeCount > 0 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-champagne px-1 text-[0.68rem] font-bold text-navy-950">
                  {activeCount}
                </span>
              )}
            </button>
            <label className="sr-only" htmlFor="sortierung">
              {t.filters.sort}
            </label>
            <select
              id="sortierung"
              className="field !w-auto !min-h-10 !py-1.5"
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
            >
              {(Object.keys(t.filters.sortOptions) as Sort[]).map((s) => (
                <option key={s} value={s}>
                  {t.filters.sortOptions[s]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {results.length === 0 ? (
          <div className="card grid place-items-center px-6 py-20 text-center">
            <h3 className="heading-display text-3xl text-navy-900">{t.filters.emptyTitle}</h3>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-stone-warm">{t.filters.emptyText}</p>
            <button type="button" className="btn btn-dark mt-7" onClick={() => setFilters(EMPTY)}>
              <RotateCcw size={15} />
              {t.filters.reset}
            </button>
          </div>
        ) : (
          <div className="grid gap-7 md:grid-cols-2">
              {results.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <PropertyCard p={p} priority={i < 2} />
                </motion.div>
              ))}
          </div>
        )}
      </div>

      {drawer && (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label={t.filters.title}>
          <button
            type="button"
            aria-label={t.common.close}
            className="absolute inset-0 bg-navy-950/25"
            onClick={() => setDrawer(false)}
          />
          <div className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-ivory shadow-lift">
            <div className="flex items-center justify-between border-b border-sand px-5 py-4">
              <h2 className="heading-display text-2xl text-navy-900">{t.filters.title}</h2>
              <button
                type="button"
                aria-label={t.common.close}
                className="grid h-10 w-10 place-items-center rounded-full hover:bg-sand/60"
                onClick={() => setDrawer(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5">{panel("m")}</div>
            <div className="border-t border-sand p-4">
              <button type="button" className="btn btn-dark w-full" onClick={() => setDrawer(false)}>
                {t.filters.apply} · {results.length}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
