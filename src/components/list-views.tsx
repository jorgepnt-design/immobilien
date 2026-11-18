"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Bookmark, Download, FileText, Scale, Trash2, X } from "lucide-react";
import type { Fact, PropertySummary } from "@/lib/types";
import { formatArea, formatPercent, formatPrice, locationLine } from "@/lib/format";
import { countryName } from "@/lib/countries";
import { fill } from "@/lib/i18n/dictionary";
import { site } from "@/config/site";
import { clearList, toggleInList, useI18n, useLists, useListsReady, type ListName } from "./providers";
import { ImagePlaceholder, PropertyCard } from "./property-card";

function EmptyList({ icon: Icon, title, text }: { icon: typeof Bookmark; title: string; text: string }) {
  const { t, href } = useI18n();
  return (
    <div className="card grid place-items-center px-6 py-20 text-center">
      <Icon size={36} strokeWidth={1.1} className="text-champagne-dark" />
      <h2 className="heading-display mt-5 text-3xl text-navy-900">{title}</h2>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-stone-warm">{text}</p>
      <Link href={href("/immobilien")} className="btn btn-dark mt-7">
        {t.watchlist.browse}
      </Link>
    </div>
  );
}

function useSelection<T extends { id: string }>(items: T[], list: ListName) {
  const lists = useLists();
  const ready = useListsReady();
  const byId = new Map(items.map((p) => [p.id, p]));
  const selected = lists[list].map((id) => byId.get(id)).filter((p): p is T => Boolean(p));
  return { ready, selected };
}

function Skeleton() {
  return <div aria-hidden className="h-64 animate-pulse rounded-2xl bg-sand/50" />;
}

/* ---------- Merkliste ---------- */

export function WatchlistView({ items }: { items: PropertySummary[] }) {
  const { t } = useI18n();
  const { ready, selected } = useSelection(items, "watch");
  if (!ready) return <Skeleton />;
  if (selected.length === 0)
    return <EmptyList icon={Bookmark} title={t.watchlist.emptyTitle} text={t.watchlist.emptyText} />;
  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-navy-900">{fill(t.watchlist.count, { n: selected.length })}</p>
        <button type="button" className="btn btn-outline !min-h-10 !px-4" onClick={() => clearList("watch")}>
          <Trash2 size={15} />
          {t.watchlist.clear}
        </button>
      </div>
      <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
        {selected.map((p) => (
          <PropertyCard key={p.id} p={p} />
        ))}
      </div>
    </>
  );
}

/* ---------- Vergleich ---------- */

export function CompareView({ items }: { items: PropertySummary[] }) {
  const { t, locale, href } = useI18n();
  const { ready, selected } = useSelection(items, "compare");
  if (!ready) return <Skeleton />;
  if (selected.length === 0)
    return <EmptyList icon={Scale} title={t.compare.emptyTitle} text={t.compare.emptyText} />;

  const dash = "–";
  const rows: { label: string; cell: (p: PropertySummary) => React.ReactNode }[] = [
    {
      label: t.compare.location,
      cell: (p) => (
        <>
          {countryName(p.country, locale)}
          <span className="block text-stone-warm">
            {p.region} · {locationLine(p)}
          </span>
        </>
      ),
    },
    { label: t.compare.price, cell: (p) => <strong className="font-semibold">{formatPrice(p.price, locale, t)}</strong> },
    { label: t.compare.type, cell: (p) => t.types[p.type] },
    { label: t.compare.investmentType, cell: (p) => t.investmentTypes[p.investmentType] },
    { label: t.compare.plot, cell: (p) => (p.plotArea ? formatArea(p.plotArea, locale, t) : dash) },
    {
      label: t.compare.area,
      cell: (p) =>
        p.mainArea ? (
          <>
            {formatArea(p.mainArea, locale, t)}
            <span className="block text-stone-warm">
              {t.card[p.mainArea.kind]}
              {p.mainArea.planned ? ` (${t.common.planned})` : ""}
            </span>
          </>
        ) : (
          dash
        ),
    },
    { label: t.compare.units, cell: (p) => (p.units ? `${p.units.count} ${p.units.label}` : dash) },
    {
      label: t.compare.rental,
      cell: (p) => (
        <>
          {t.rental[p.rentalStatus]}
          <span className="mt-1 block text-xs leading-relaxed text-stone-warm">{p.rentalText}</span>
        </>
      ),
    },
    {
      label: t.compare.yield,
      cell: (p) =>
        p.yieldPercent !== undefined ? (
          <>
            <strong className="font-semibold">{formatPercent(p.yieldPercent, locale)}</strong>
            <span className="block text-xs text-stone-warm">{p.yieldLabel}</span>
          </>
        ) : (
          <span className="text-stone-warm">{t.common.notSpecified}</span>
        ),
    },
    {
      label: t.compare.potential,
      cell: (p) =>
        p.potentialTitles.length > 0 ? (
          <ul className="list-disc space-y-1 pl-4 text-xs leading-relaxed">
            {p.potentialTitles.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        ) : (
          dash
        ),
    },
  ];

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm font-medium text-navy-900">{fill(t.compare.slots, { n: selected.length })}</p>
        <button type="button" className="btn btn-outline !min-h-10 !px-4" onClick={() => clearList("compare")}>
          <Trash2 size={15} />
          {t.compare.clear}
        </button>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm" style={{ minWidth: `${12 + selected.length * 15}rem` }}>
          <thead>
            <tr>
              <th scope="col" className="w-44 px-5 py-5 align-bottom text-[0.68rem] font-semibold tracking-[0.1em] uppercase text-stone-warm">
                {t.compare.criterion}
              </th>
              {selected.map((p) => (
                <th key={p.id} scope="col" className="px-5 py-5 align-top font-normal">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-navy-800">
                    {p.cover ? (
                      <Image src={p.cover.src} alt={p.cover.alt} fill sizes="260px" className="object-cover" />
                    ) : (
                      <ImagePlaceholder label={t.card.noImage} />
                    )}
                    <button
                      type="button"
                      onClick={() => toggleInList("compare", p.id)}
                      aria-label={`${t.actions.compareRemove}: ${p.title}`}
                      className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-navy-950/70 text-white hover:bg-navy-950"
                    >
                      <X size={15} />
                    </button>
                  </div>
                  <p className="mt-3 text-[0.65rem] font-semibold tracking-[0.12em] uppercase text-champagne-dark">{p.id}</p>
                  <Link
                    href={href(`/immobilien/${p.slug}`)}
                    className="heading-display mt-1 block text-xl text-navy-900 hover:text-champagne-dark"
                  >
                    {p.title}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-sand/70 border-t border-sand">
            {rows.map((r) => (
              <tr key={r.label} className="align-top">
                <th scope="row" className="px-5 py-4 text-[0.72rem] font-semibold tracking-[0.06em] uppercase text-stone-warm">
                  {r.label}
                </th>
                {selected.map((p) => (
                  <td key={p.id} className="px-5 py-4 text-navy-900">
                    {r.cell(p)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ---------- Dossier ---------- */

export interface DossierItem extends PropertySummary {
  keyFacts: Fact[];
  highlights: string[];
  dataNotes: string[];
  intro: string;
}

export function DossierView({ items }: { items: DossierItem[] }) {
  const { t, locale, href } = useI18n();
  const { ready, selected } = useSelection(items, "dossier");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  if (!ready) return <Skeleton />;
  if (selected.length === 0)
    return <EmptyList icon={FileText} title={t.dossier.emptyTitle} text={t.dossier.emptyText} />;

  const exportPdf = async () => {
    setBusy(true);
    setError(false);
    try {
      // jsPDF wird erst beim Export geladen und belastet die Seite nicht
      const { buildDossierPdf } = await import("@/lib/dossier-pdf");
      const doc = await buildDossierPdf(selected, { t, locale, siteName: site.name, siteUrl: window.location.origin });
      doc.save(`investment-dossier-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (e) {
      console.error(e);
      setError(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm font-medium text-navy-900">
          {selected.length === 1 ? t.dossier.selectedOne : fill(t.dossier.selected, { n: selected.length })}
        </p>
        <div className="flex flex-wrap gap-3">
          <button type="button" className="btn btn-outline !min-h-10 !px-4" onClick={() => clearList("dossier")}>
            <Trash2 size={15} />
            {t.dossier.clear}
          </button>
          <button type="button" className="btn btn-gold" onClick={exportPdf} disabled={busy}>
            <Download size={16} />
            {busy ? t.dossier.exporting : t.dossier.export}
          </button>
        </div>
      </div>
      {error && (
        <p role="alert" className="mb-6 rounded-xl border border-red-800/20 bg-red-50 px-4 py-3 text-sm text-red-900">
          {t.dossier.exportError}
        </p>
      )}
      <ol className="space-y-4">
        {selected.map((p, i) => (
          <li key={p.id} className="card flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
            <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-xl bg-navy-800 sm:w-52">
              {p.cover ? (
                <Image src={p.cover.src} alt={p.cover.alt} fill sizes="220px" className="object-cover" />
              ) : (
                <ImagePlaceholder label={t.card.noImage} />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[0.65rem] font-semibold tracking-[0.12em] uppercase text-champagne-dark">
                {String(i + 1).padStart(2, "0")} · {p.id} · {t.types[p.type]}
              </p>
              <Link
                href={href(`/immobilien/${p.slug}`)}
                className="heading-display mt-1 block text-2xl text-navy-900 hover:text-champagne-dark"
              >
                {p.title}
              </Link>
              <p className="mt-1 text-sm text-stone-warm">
                {countryName(p.country, locale)} · {locationLine(p)}
              </p>
              <p className="mt-3 text-sm font-semibold text-navy-900">{formatPrice(p.price, locale, t)}</p>
            </div>
            <button
              type="button"
              onClick={() => toggleInList("dossier", p.id)}
              aria-label={`${t.actions.dossierRemove}: ${p.title}`}
              className="grid h-10 w-10 shrink-0 place-items-center self-end rounded-full border border-sand text-stone-warm hover:border-navy-800 hover:text-navy-900 sm:self-center"
            >
              <X size={16} />
            </button>
          </li>
        ))}
      </ol>
    </>
  );
}
