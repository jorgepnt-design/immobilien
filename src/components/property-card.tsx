"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import type { PropertySummary, Status } from "@/lib/types";
import { formatArea, formatPrice, locationLine } from "@/lib/format";
import { countryName } from "@/lib/countries";
import { useI18n } from "./providers";
import { ListIconButton } from "./list-buttons";

const STATUS_STYLE: Record<Status, string> = {
  verfuegbar: "bg-emerald-900/85 text-emerald-50",
  reserviert: "bg-amber-800/90 text-amber-50",
  verkauft: "bg-stone-700/90 text-stone-100",
};

export function StatusBadge({ status }: { status: Status }) {
  const { t } = useI18n();
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.68rem] font-semibold tracking-[0.12em] uppercase backdrop-blur ${STATUS_STYLE[status]}`}
    >
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
      {t.status[status]}
    </span>
  );
}

/** Dezentes Linienmuster für Objekte ohne Bildmaterial – kein Objektfoto. */
export function ImagePlaceholder({ label }: { label: string }) {
  return (
    <div className="absolute inset-0 grid place-items-center overflow-hidden bg-navy-800">
      <svg aria-hidden className="absolute inset-0 h-full w-full opacity-30" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
        {Array.from({ length: 14 }, (_, i) => (
          <ellipse
            key={i}
            cx={250 + i * 3}
            cy={130 - i * 2}
            rx={20 + i * 24}
            ry={12 + i * 16}
            fill="none"
            stroke="#c6a567"
            strokeWidth="0.7"
            transform={`rotate(${-12 + i} 250 130)`}
          />
        ))}
      </svg>
      <span className="relative rounded-full border border-champagne/50 px-4 py-1.5 text-[0.68rem] font-medium tracking-[0.18em] uppercase text-champagne-light">
        {label}
      </span>
    </div>
  );
}

export function PropertyCard({ p, priority = false }: { p: PropertySummary; priority?: boolean }) {
  const { t, locale, href } = useI18n();
  const url = href(`/immobilien/${p.slug}`);

  const facts: { label: string; value: string }[] = [];
  if (p.mainArea) facts.push({ label: t.card[p.mainArea.kind], value: formatArea(p.mainArea, locale, t) });
  if (p.plotArea) facts.push({ label: t.card.plot, value: formatArea(p.plotArea, locale, t) });
  if (p.units) facts.push({ label: t.card.units, value: String(p.units.count) });

  return (
    <article className="card group relative flex h-full flex-col overflow-hidden transition-[box-shadow,transform] duration-500 hover:-translate-y-1 hover:shadow-lift">
      <div className="relative aspect-[4/3] overflow-hidden bg-navy-800">
        {p.cover ? (
          <Image
            src={p.cover.src}
            alt={p.cover.alt}
            fill
            priority={priority}
            sizes="(min-width: 1280px) 400px, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.045]"
          />
        ) : (
          <ImagePlaceholder label={t.card.noImage} />
        )}
        <div aria-hidden className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-navy-950/55 to-transparent" />
        <div className="absolute left-4 top-4">
          <StatusBadge status={p.status} />
        </div>
        <div className="absolute right-4 top-4 z-10 flex gap-2">
          <ListIconButton list="watch" id={p.id} />
          <ListIconButton list="compare" id={p.id} />
          <ListIconButton list="dossier" id={p.id} />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between gap-3 text-[0.68rem] font-semibold tracking-[0.14em] uppercase">
          <span className="text-champagne-dark">{t.types[p.type]}</span>
          <span className="text-stone-warm/70">{p.id}</span>
        </div>

        <h3 className="heading-display mt-3 text-[1.65rem] text-navy-900">
          <Link href={url} className="after:absolute after:inset-0 after:content-['']">
            {p.title}
          </Link>
        </h3>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-stone-warm">
          <MapPin size={14} strokeWidth={1.6} className="shrink-0 text-champagne-dark" />
          {countryName(p.country, locale)} · {locationLine(p)}
        </p>

        <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-ink/75">{p.teaser}</p>

        <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-sand/80 pt-4">
          {facts.map((f) => (
            <div key={f.label}>
              <dt className="text-[0.62rem] font-semibold tracking-[0.1em] uppercase text-stone-warm/80">
                {f.label}
              </dt>
              <dd className="mt-1 text-sm font-medium text-navy-900">{f.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-auto flex items-end justify-between gap-4 pt-6">
          <div>
            <p className="text-[0.62rem] font-semibold tracking-[0.1em] uppercase text-stone-warm/80">
              {t.price.label}
            </p>
            <p className="heading-display mt-1 text-2xl text-navy-900">{formatPrice(p.price, locale, t)}</p>
          </div>
          <span className="inline-flex items-center gap-2 text-[0.78rem] font-semibold tracking-[0.06em] text-navy-900 transition-colors group-hover:text-champagne-dark">
            {t.card.discover}
            <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </article>
  );
}
