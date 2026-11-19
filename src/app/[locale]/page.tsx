import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, FileSearch, Handshake, ShieldCheck } from "lucide-react";
import { isLocale } from "@/config/site";
import { fill, getDictionary } from "@/lib/i18n/dictionary";
import { getAllSummaries, getPortfolioStats } from "@/lib/properties";
import { formatVolume } from "@/lib/format";
import type { PropertyType } from "@/lib/types";
import { HeroSearch } from "@/components/hero-search";
import { PropertyCard } from "@/components/property-card";
import { Reveal } from "@/components/reveal";
import { EmptyPortfolio } from "@/components/empty-state";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const href = (p: string) => `/${locale}${p}`;

  const items = getAllSummaries();
  const stats = getPortfolioStats();
  const featured = items.filter((p) => p.status !== "verkauft").slice(0, 6);
  const countries = [...new Set(items.map((p) => p.country))].sort();
  const types = [...new Set(items.map((p) => p.type))].sort() as PropertyType[];

  const statItems = [
    { value: String(stats.count), label: t.stats.properties },
    { value: String(stats.countries), label: t.stats.countries },
    { value: String(stats.locations), label: t.stats.locations },
    {
      value: stats.pricedCount > 0 ? formatVolume(stats.volume, locale) : "–",
      label: t.stats.volume,
      note:
        stats.pricedCount > 0
          ? fill(t.stats.volumeNote, { priced: stats.pricedCount, count: stats.count })
          : t.stats.volumeNone,
    },
  ];
  const approachIcons = [FileSearch, ShieldCheck, Handshake];

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-warmwhite text-navy-900">
        {/* Bewusst kein Objektfoto: abstraktes Linienmuster, damit kein Angebot identifizierbar wird */}
        <svg
          aria-hidden
          className="absolute inset-0 -z-20 h-full w-full opacity-45"
          viewBox="0 0 1600 900"
          preserveAspectRatio="xMidYMid slice"
        >
          {Array.from({ length: 22 }, (_, i) => (
            <ellipse
              key={i}
              cx={1150 + i * 6}
              cy={380 - i * 4}
              rx={60 + i * 62}
              ry={36 + i * 40}
              fill="none"
              stroke="var(--color-babyblue)"
              strokeWidth="0.8"
              transform={`rotate(${-14 + i * 0.8} 1150 380)`}
            />
          ))}
        </svg>
        <div
          aria-hidden
          className="absolute inset-0 -z-10 hero-glow"
        />
        <div className="container-page flex min-h-[38rem] flex-col justify-center pb-36 pt-24 md:min-h-[44rem] md:pt-28">
          <div>
            <p className="eyebrow">{t.hero.eyebrow}</p>
            <h1 className="heading-display mt-6 max-w-5xl text-[6.3vw] sm:text-5xl lg:text-[4.1rem]">
              {t.hero.headline1}
              <span className="block text-accent">{t.hero.headline2}</span>
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-relaxed text-ink/75 md:text-lg">{t.hero.sub}</p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="#angebot" className="btn btn-gold">
                {t.hero.cta1}
              </Link>
              <Link href={href("/immobilien")} className="btn btn-outline">
                {t.hero.cta2}
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Suche */}
      {items.length > 0 && (
        <div className="container-page relative z-10 -mt-24 md:-mt-10">
          <HeroSearch countries={countries} types={types} />
        </div>
      )}

      {/* Portfolio-Kennzahlen */}
      <section aria-labelledby="portfolio" className="container-page pt-20 md:pt-24">
        <Reveal>
          <p className="eyebrow">{t.stats.heading}</p>
          <h2 id="portfolio" className="sr-only">
            {t.stats.heading}
          </h2>
          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 border-y border-sand py-10 lg:grid-cols-4">
            {statItems.map((s) => (
              <div key={s.label} className="flex flex-col-reverse">
                <dt className="mt-3 text-[0.72rem] font-semibold tracking-[0.14em] uppercase text-stone-warm">
                  {s.label}
                  {s.note && (
                    <span className="mt-1 block text-[0.7rem] font-normal tracking-normal normal-case text-stone-warm/80">
                      {s.note}
                    </span>
                  )}
                </dt>
                <dd className="heading-display text-5xl text-navy-900 md:text-6xl">{s.value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </section>

      {/* Ausgewählte Immobilien */}
      <section id="angebot" aria-labelledby="angebot-titel" className="container-page pt-20 md:pt-28">
        {items.length === 0 ? (
          <EmptyPortfolio locale={locale} />
        ) : (
          <>
            <Reveal className="flex flex-wrap items-end justify-between gap-6">
              <div className="max-w-2xl">
                <p className="eyebrow">{t.home.featuredEyebrow}</p>
                <h2 id="angebot-titel" className="heading-display mt-4 text-4xl text-navy-900 md:text-5xl">
                  {t.home.featuredTitle}
                </h2>
                <p className="mt-4 text-base leading-relaxed text-stone-warm">{t.home.featuredSub}</p>
              </div>
              <Link href={href("/immobilien")} className="btn btn-outline">
                {t.home.allCta}
                <ArrowRight size={16} />
              </Link>
            </Reveal>
            <div className="mt-12 grid gap-7 md:grid-cols-2 xl:grid-cols-3">
              {featured.map((p, i) => (
                <Reveal key={p.id} delay={(i % 3) * 0.08} className="h-full">
                  <PropertyCard p={p} />
                </Reveal>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Arbeitsweise */}
      <section aria-labelledby="arbeitsweise" className="mt-24 bg-cloud py-20 text-navy-900 md:mt-32 md:py-28">
        <div className="container-page">
          <Reveal className="max-w-2xl">
            <p className="eyebrow">{t.home.approachEyebrow}</p>
            <h2 id="arbeitsweise" className="heading-display mt-4 text-4xl md:text-5xl">
              {t.home.approachTitle}
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-10 md:grid-cols-3">
            {t.home.approach.map((a, i) => {
              const Icon = approachIcons[i];
              return (
                <Reveal key={a.title} delay={i * 0.1}>
                  <Icon size={28} strokeWidth={1.3} className="text-accent" />
                  <h3 className="heading-display mt-5 text-2xl">{a.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink/70">{a.text}</p>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Kontakt-CTA */}
      <section className="container-page pt-20 md:pt-28">
        <Reveal className="card flex flex-col items-start justify-between gap-8 p-8 md:flex-row md:items-center md:p-14">
          <div className="max-w-2xl">
            <h2 className="heading-display text-3xl text-navy-900 md:text-4xl">{t.home.ctaTitle}</h2>
            <p className="mt-3 text-base leading-relaxed text-stone-warm">{t.home.ctaText}</p>
          </div>
          <Link href={href("/kontakt")} className="btn btn-dark shrink-0">
            {t.home.ctaButton}
            <ArrowRight size={16} />
          </Link>
        </Reveal>
      </section>
    </>
  );
}
