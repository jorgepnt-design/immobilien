import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, ChevronRight, Download, FileLock2, Info, MapPin } from "lucide-react";
import { isLocale, site, type Locale } from "@/config/site";
import { fill, getDictionary, type Dictionary } from "@/lib/i18n/dictionary";
import { getAllProperties, getProperty, getSimilar } from "@/lib/properties";
import { formatArea, formatCurrency, formatPercent, formatPrice, locationLine } from "@/lib/format";
import { countryName } from "@/lib/countries";
import type { Evidence, Fact, Property } from "@/lib/types";
import { Gallery, PlanGrid } from "@/components/gallery";
import { CommissionNotice } from "@/components/commission-notice";
import { ContactDetails } from "@/components/contact";
import { ExposeRequest } from "@/components/expose-request";
import { ListTextButton } from "@/components/list-buttons";
import { MapConsent } from "@/components/map-consent";
import { PropertyCard, StatusBadge } from "@/components/property-card";

export function generateStaticParams() {
  return getAllProperties().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/immobilien/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  const p = getProperty(slug);
  if (!p || !isLocale(locale)) return {};
  const t = getDictionary(locale);
  const title = `${p.title} – ${p.location.city}`;
  const description = `${t.types[p.type]} · ${p.teaser}`;
  const cover = p.images.find((i) => i.kind === "foto");
  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/immobilien/${p.slug}`,
      languages: { de: `/de/immobilien/${p.slug}`, en: `/en/immobilien/${p.slug}`, pt: `/pt/immobilien/${p.slug}` },
    },
    openGraph: {
      title,
      description,
      type: "article",
      images: cover ? [{ url: cover.src, width: cover.width, height: cover.height, alt: cover.alt }] : undefined,
    },
  };
}

const EVIDENCE_STYLE: Record<Evidence, string> = {
  fakt: "border-mint bg-mint text-navy-900",
  anbieter: "border-sky bg-sky text-navy-900",
  potenzial: "border-lilac bg-lilac text-navy-900",
  annahme: "border-vanilla bg-vanilla text-navy-900",
  berechnet: "border-babyblue bg-babyblue text-navy-900",
};

function EvidenceBadge({ evidence, t }: { evidence: Evidence; t: Dictionary }) {
  return (
    <span
      title={t.evidence[`${evidence}Hint`]}
      className={`inline-block shrink-0 rounded-full border px-2 py-0.5 text-[0.62rem] font-semibold tracking-[0.06em] uppercase ${EVIDENCE_STYLE[evidence]}`}
    >
      {t.evidence[evidence]}
    </span>
  );
}

function FactList({ facts, t }: { facts: Fact[]; t: Dictionary }) {
  return (
    <dl className="divide-y divide-sand/80 border-y border-sand/80">
      {facts.map((f) => (
        <div key={f.label} className="grid gap-x-6 gap-y-1 py-3.5 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <dt className="text-sm text-stone-warm">{f.label}</dt>
          <dd className="text-sm text-navy-900">
            <span className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1.5">
              <span className="font-medium">{f.value}</span>
              <EvidenceBadge evidence={f.evidence} t={t} />
            </span>
            {f.note && <span className="mt-1 block text-xs text-stone-warm">{f.note}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="border-t border-sand pt-10">
      <h2 id={id} className="heading-display text-3xl text-navy-900 md:text-[2.1rem]">
        {title}
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function jsonLd(p: Property, locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: p.title,
    description: p.teaser,
    url: `${site.url}/${locale}/immobilien/${p.slug}`,
    identifier: p.id,
    datePosted: p.listedAt,
    image: p.images.filter((i) => i.kind === "foto").map((i) => `${site.url}${i.src}`),
    contentLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: p.location.city,
        addressRegion: p.location.region,
        addressCountry: p.location.country,
      },
    },
    ...(p.price.amount !== null && {
      offers: {
        "@type": "Offer",
        price: p.price.amount,
        priceCurrency: p.price.currency,
        availability: p.status === "verfuegbar" ? "https://schema.org/InStock" : "https://schema.org/LimitedAvailability",
      },
    }),
  };
}

export default async function PropertyPage({ params }: PageProps<"/[locale]/immobilien/[slug]">) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const p = getProperty(slug);
  if (!p) notFound();
  const t = getDictionary(locale);
  const href = (path: string) => `/${locale}${path}`;

  const photos = p.images.filter((i) => i.kind === "foto");
  const plans = p.images.filter((i) => i.kind === "plan");
  const similar = getSimilar(p);
  // Bei Entwicklungsprojekten und Grundstücken steht das Baurecht im Vordergrund
  const planningFirst = p.type === "entwicklungsprojekt" || p.type === "grundstueck";

  const summary: { label: string; value: string }[] = [
    { label: t.detail.type, value: t.types[p.type] },
    { label: t.detail.investmentType, value: t.investmentTypes[p.investmentType] },
  ];
  if (p.areas.plot) summary.push({ label: t.card.plot, value: formatArea(p.areas.plot, locale, t) });
  if (p.areas.usable) summary.push({ label: t.card.usable, value: formatArea(p.areas.usable, locale, t) });
  if (p.areas.living)
    summary.push({
      label: p.areas.living.planned ? `${t.card.living} (${t.common.planned})` : t.card.living,
      value: formatArea(p.areas.living, locale, t),
    });
  if (p.units) summary.push({ label: t.detail.units, value: `${p.units.count} ${p.units.label}` });
  if (p.yearBuilt) summary.push({ label: t.detail.yearBuilt, value: p.yearBuilt });
  summary.push({ label: t.detail.rentalStatus, value: t.rental[p.rental.status] });
  if (p.yield) summary.push({ label: t.detail.yield, value: formatPercent(p.yield.percent, locale) });

  const planningSection = p.planning && p.planning.length > 0 && (
    <Section id="baurecht" title={t.detail.planning}>
      <FactList facts={p.planning} t={t} />
    </Section>
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(p, locale)).replace(/</g, "\\u003c") }}
      />

      {/* Kopfbereich */}
      <section className="bg-cloud text-navy-900">
        <div className="container-page pb-10 pt-8 md:pb-14">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-stone-warm">
            <Link href={href("/immobilien")} className="hover:text-accent">
              {t.detail.breadcrumb}
            </Link>
            <ChevronRight size={13} />
            <span className="text-navy-800">{p.title}</span>
          </nav>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <StatusBadge status={p.status} />
            <span className="eyebrow">{t.types[p.type]}</span>
            <span className="text-xs tracking-[0.14em] text-stone-warm">
              {t.detail.objectId} {p.id}
            </span>
          </div>
          <h1 className="heading-display mt-5 max-w-4xl text-4xl md:text-5xl">{p.title}</h1>
          <p className="mt-4 max-w-3xl text-lg text-ink/75">{p.subtitle}</p>
          <p className="mt-5 flex items-center gap-2 text-sm text-ink/80">
            <MapPin size={16} strokeWidth={1.5} className="text-accent" />
            {countryName(p.location.country, locale)} · {p.location.region} · {locationLine(p.location)}
          </p>
        </div>
      </section>

      <div className="container-page">
        {/* A. Galerie */}
        <div className="-mt-4 md:-mt-6">
          <Gallery images={photos} />
        </div>

        {t.detail.contentLanguageNote && (
          <p className="mt-6 flex items-start gap-2 rounded-xl border border-sand bg-white px-4 py-3 text-sm text-stone-warm">
            <Info size={16} className="mt-0.5 shrink-0 text-champagne-dark" />
            {t.detail.contentLanguageNote}
          </p>
        )}

        <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-16">
          {/* Hauptspalte */}
          <div className="min-w-0 space-y-12">
            {/* C. Eckdaten */}
            <section aria-labelledby="eckdaten">
              <h2 id="eckdaten" className="heading-display text-3xl text-navy-900 md:text-[2.1rem]">
                {t.detail.keyData}
              </h2>
              <div className="mt-6">
                <FactList facts={p.keyFacts} t={t} />
              </div>
              <details className="mt-4 text-xs text-stone-warm">
                <summary className="cursor-pointer font-semibold tracking-wide hover:text-navy-900">
                  {t.evidence.legend}
                </summary>
                <ul className="mt-3 space-y-2">
                  {(["fakt", "anbieter", "potenzial", "annahme", "berechnet"] as Evidence[]).map((e) => (
                    <li key={e} className="flex items-center gap-3">
                      <EvidenceBadge evidence={e} t={t} />
                      {t.evidence[`${e}Hint`]}
                    </li>
                  ))}
                </ul>
              </details>
            </section>

            {planningFirst && planningSection}

            {/* D. Beschreibung */}
            <Section id="beschreibung" title={t.detail.description}>
              <div className="space-y-4 text-[0.97rem] leading-[1.8] text-ink/85">
                {p.description.map((para) => (
                  <p key={para}>{para}</p>
                ))}
              </div>
            </Section>

            {/* E. Highlights */}
            <Section id="highlights" title={t.detail.highlights}>
              <ul className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                {p.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-3 text-sm leading-relaxed text-ink/85">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-sun text-champagne-dark">
                      <Check size={12} strokeWidth={2.5} />
                    </span>
                    {h}
                  </li>
                ))}
              </ul>
            </Section>

            {/* F. Potenzial */}
            {p.potential.length > 0 && (
              <Section id="potenzial" title={t.detail.potential}>
                <div className="grid gap-4 sm:grid-cols-2">
                  {p.potential.map((x) => (
                    <div key={x.title} className="rounded-2xl border border-sand bg-white p-6">
                      <EvidenceBadge evidence={x.evidence} t={t} />
                      <h3 className="heading-display mt-3 text-xl text-navy-900">{x.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-ink/75">{x.text}</p>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* G. Flächen */}
            {p.areaTable && (
              <Section id="flaechen" title={t.detail.areas}>
                {p.areaTable.title && <p className="mb-4 text-sm font-medium text-navy-900">{p.areaTable.title}</p>}
                <div className="overflow-x-auto rounded-2xl border border-sand bg-white">
                  <table className="w-full min-w-[30rem] text-left text-sm">
                    <thead>
                      <tr className="border-b border-sand text-[0.68rem] tracking-[0.1em] uppercase text-stone-warm">
                        <th scope="col" className="px-5 py-3 font-semibold">{t.detail.areaName}</th>
                        <th scope="col" className="px-5 py-3 font-semibold">{t.detail.areaUse}</th>
                        <th scope="col" className="px-5 py-3 text-right font-semibold">{t.detail.areaSize}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sand/70">
                      {p.areaTable.rows.map((r) => (
                        <tr key={r.name}>
                          <th scope="row" className="px-5 py-3 font-medium text-navy-900">{r.name}</th>
                          <td className="px-5 py-3 text-stone-warm">{r.use}</td>
                          <td className="whitespace-nowrap px-5 py-3 text-right font-medium text-navy-900">{r.area}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {p.areaTable.note && <p className="mt-3 text-xs leading-relaxed text-stone-warm">{p.areaTable.note}</p>}
              </Section>
            )}

            {/* H. Mieteinnahmen und Rendite */}
            <Section id="wirtschaftlichkeit" title={t.detail.economics}>
              <div className="rounded-2xl border border-sand bg-white p-6">
                <p className="text-[0.68rem] font-semibold tracking-[0.1em] uppercase text-stone-warm">
                  {t.detail.rentalStatus}
                </p>
                <p className="mt-1 font-medium text-navy-900">{t.rental[p.rental.status]}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink/75">{p.rental.text}</p>
                {p.rental.annualNetRent !== undefined && (
                  <p className="mt-4 text-sm text-navy-900">
                    <span className="text-stone-warm">{t.detail.annualRent}: </span>
                    <span className="font-semibold">{formatCurrency(p.rental.annualNetRent, "EUR", locale)}</span>
                  </p>
                )}
                {p.rental.rentNote && <p className="mt-2 text-xs leading-relaxed text-stone-warm">{p.rental.rentNote}</p>}
              </div>

              {p.yield ? (
                <div className="mt-4 rounded-2xl bg-mint p-6 text-navy-900 md:p-8">
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <p className="eyebrow">{p.yield.label}</p>
                      <p className="heading-display mt-2 text-5xl">{formatPercent(p.yield.percent, locale)}</p>
                    </div>
                    <EvidenceBadge evidence="berechnet" t={t} />
                  </div>
                  <dl className="mt-6 space-y-4 border-t border-navy-900/10 pt-6 text-sm">
                    <div>
                      <dt className="text-[0.68rem] font-semibold tracking-[0.1em] uppercase text-stone-warm">{t.detail.formula}</dt>
                      <dd className="mt-1 font-mono text-[0.85rem] text-accent-dark">{p.yield.formula}</dd>
                    </div>
                    <div>
                      <dt className="text-[0.68rem] font-semibold tracking-[0.1em] uppercase text-stone-warm">{t.detail.basis}</dt>
                      <dd className="mt-1 leading-relaxed text-navy-800">{p.yield.basis}</dd>
                    </div>
                    <div>
                      <dt className="text-[0.68rem] font-semibold tracking-[0.1em] uppercase text-stone-warm">{t.detail.caveat}</dt>
                      <dd className="mt-1 leading-relaxed text-navy-800">{p.yield.caveat}</dd>
                    </div>
                  </dl>
                </div>
              ) : (
                <p className="mt-4 flex items-start gap-2 text-sm leading-relaxed text-stone-warm">
                  <Info size={16} className="mt-0.5 shrink-0 text-champagne-dark" />
                  {t.detail.noYield}
                </p>
              )}

              {p.economics && p.economics.length > 0 && (
                <div className="mt-8">
                  <h3 className="mb-3 text-sm font-semibold text-navy-900">{t.detail.figures}</h3>
                  <FactList facts={p.economics} t={t} />
                </div>
              )}
            </Section>

            {!planningFirst && planningSection}

            {/* Energie */}
            <Section id="energie" title={t.detail.energy}>
              {p.energy && p.energy.length > 0 ? (
                <FactList facts={p.energy} t={t} />
              ) : (
                <p className="text-sm text-stone-warm">{t.detail.energyMissing}</p>
              )}
            </Section>

            {/* I. Standort */}
            <Section id="standort" title={t.detail.location}>
              <p className="mb-5 flex items-center gap-2 text-sm font-medium text-navy-900">
                <MapPin size={16} className="text-champagne-dark" />
                {t.detail.addressOnRequest}
              </p>
              <div className="space-y-4 text-[0.97rem] leading-[1.8] text-ink/85">
                {p.location.description.map((para) => (
                  <p key={para}>{para}</p>
                ))}
              </div>
              {p.location.connections && (
                <dl className="mt-6 grid gap-3 sm:grid-cols-2">
                  {p.location.connections.map((c) => (
                    <div key={c.label} className="flex items-baseline justify-between gap-4 rounded-xl border border-sand bg-white px-4 py-3">
                      <dt className="text-sm text-stone-warm">{c.label}</dt>
                      <dd className="text-sm font-semibold text-navy-900">{c.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {p.location.mapCenter && (
                <div className="mt-6">
                  <MapConsent
                    center={p.location.mapCenter}
                    title={`${t.detail.location}: ${p.location.city}`}
                  />
                </div>
              )}
            </Section>

            {/* J./K. Dokumente */}
            <Section id="dokumente" title={t.detail.documents}>
              {plans.length > 0 && (
                <div className="mb-6">
                  <PlanGrid images={plans} />
                </div>
              )}
              {p.exposeDownload ? (
                <a href={p.exposeDownload} download className="btn btn-outline">
                  <Download size={16} />
                  {t.detail.exposeDownload}
                </a>
              ) : (
                <div className="flex flex-col items-start gap-4 rounded-2xl border border-sand bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
                  <p className="flex items-start gap-3 text-sm leading-relaxed text-ink/75">
                    <FileLock2 size={20} strokeWidth={1.4} className="mt-0.5 shrink-0 text-champagne-dark" />
                    {t.detail.exposeOnRequest}
                  </p>
                  <a href="#anfrage" className="btn btn-outline shrink-0">
                    {t.detail.requestDocs}
                  </a>
                </div>
              )}
            </Section>

            {/* Datenstand */}
            <Section id="datenstand" title={t.detail.dataNotes}>
              <ul className="space-y-3">
                {p.dataNotes.map((n) => (
                  <li key={n} className="flex items-start gap-3 text-sm leading-relaxed text-ink/80">
                    <Info size={16} className="mt-0.5 shrink-0 text-accent" />
                    {n}
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-xs text-stone-warm">
                {t.detail.source}: {p.source}
              </p>
              <p className="mt-3 text-xs leading-relaxed text-stone-warm">{t.detail.disclaimer}</p>
            </Section>

            <CommissionNotice />

            {/* L. Stufe 2: vollständiges Exposé nur auf qualifizierte Anfrage */}
            <section id="anfrage" aria-labelledby="anfrage-titel" className="card scroll-mt-28 p-6 md:p-10">
              <p className="eyebrow">
                {t.detail.objectId} {p.id}
              </p>
              <h2 id="anfrage-titel" className="heading-display mt-3 text-3xl text-navy-900 md:text-4xl">
                {t.form.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-stone-warm">{fill(t.form.intro, { id: p.id })}</p>
              <ol className="my-8 grid gap-4 sm:grid-cols-3">
                {t.form.steps.map((step, i) => (
                  <li key={step.title} className="rounded-xl border border-sand bg-ivory px-4 py-4">
                    <span className="heading-display text-2xl text-champagne-dark">{i + 1}</span>
                    <p className="mt-1 text-sm font-semibold text-navy-900">{step.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-stone-warm">{step.text}</p>
                  </li>
                ))}
              </ol>
              <ExposeRequest propertyId={p.id} propertyTitle={p.title} />
              <div className="mt-10 border-t border-sand pt-8">
                <ContactDetails />
              </div>
            </section>
          </div>

          {/* B. Seitenleiste: Preis, Status, Aktionen */}
          <aside className="order-first lg:order-none">
            <div className="card p-6 md:p-7 lg:sticky lg:top-24">
              <p className="text-[0.68rem] font-semibold tracking-[0.12em] uppercase text-stone-warm">{t.price.label}</p>
              <p className="heading-display mt-1 text-4xl text-navy-900">{formatPrice(p.price, locale, t)}</p>
              {p.price.note && <p className="mt-2 text-xs leading-relaxed text-stone-warm">{p.price.note}</p>}

              <dl className="mt-6 divide-y divide-sand/80 border-y border-sand/80">
                {summary.map((s) => (
                  <div key={s.label} className="flex items-baseline justify-between gap-4 py-2.5">
                    <dt className="text-xs text-stone-warm">{s.label}</dt>
                    <dd className="text-right text-sm font-medium text-navy-900">{s.value}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-6 flex flex-col gap-3">
                <a href="#anfrage" className="btn btn-gold w-full">
                  {t.detail.inquiryCta}
                </a>
              </div>

              <div className="mt-6 flex flex-wrap gap-2 border-t border-sand/80 pt-5">
                <ListTextButton list="watch" id={p.id} />
                <ListTextButton list="compare" id={p.id} />
                <ListTextButton list="dossier" id={p.id} />
              </div>
            </div>
          </aside>
        </div>

        {/* M. Ähnliche Immobilien */}
        {similar.length > 0 && (
          <section aria-labelledby="aehnliche" className="mt-24">
            <h2 id="aehnliche" className="heading-display text-3xl text-navy-900 md:text-4xl">
              {t.detail.similar}
            </h2>
            <div className="mt-8 grid gap-7 md:grid-cols-2 xl:grid-cols-3">
              {similar.map((s) => (
                <PropertyCard key={s.id} p={s} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
