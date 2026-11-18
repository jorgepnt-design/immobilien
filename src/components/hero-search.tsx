"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import type { PropertyType } from "@/lib/types";
import { countryName } from "@/lib/countries";
import { useI18n } from "./providers";

/** Suchleiste der Startseite – führt mit vorbelegten Filtern zur Immobilienübersicht. */
export function HeroSearch({ countries, types }: { countries: string[]; types: PropertyType[] }) {
  const { t, locale, href } = useI18n();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [country, setCountry] = useState("");
  const [type, setType] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const sp = new URLSearchParams();
    if (q.trim()) sp.set("q", q.trim());
    if (country) sp.set("land", country);
    if (type) sp.set("typ", type);
    const qs = sp.toString();
    router.push(href("/immobilien") + (qs ? `?${qs}` : ""));
  };

  const selectClass =
    "h-12 w-full rounded-full border border-transparent bg-ivory-dark/70 px-4 text-sm text-navy-900 focus:border-champagne-dark focus:outline-none";

  return (
    <form
      onSubmit={submit}
      role="search"
      className="grid gap-2 rounded-[1.75rem] bg-white p-2.5 shadow-lift md:grid-cols-[1.5fr_1fr_1fr_auto] md:rounded-full"
    >
      <div className="relative">
        <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-warm" />
        <label htmlFor="hero-q" className="sr-only">
          {t.filters.search}
        </label>
        <input
          id="hero-q"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t.search.placeholder}
          className={`${selectClass} pl-11`}
        />
      </div>
      <div>
        <label htmlFor="hero-land" className="sr-only">
          {t.filters.country}
        </label>
        <select id="hero-land" value={country} onChange={(e) => setCountry(e.target.value)} className={selectClass}>
          <option value="">{t.search.allCountries}</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {countryName(c, locale)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="hero-typ" className="sr-only">
          {t.filters.type}
        </label>
        <select id="hero-typ" value={type} onChange={(e) => setType(e.target.value)} className={selectClass}>
          <option value="">{t.search.allTypes}</option>
          {types.map((v) => (
            <option key={v} value={v}>
              {t.types[v]}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" className="btn btn-dark h-12 !min-h-0 px-7">
        <Search size={16} />
        {t.search.submit}
      </button>
    </form>
  );
}
