import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, site } from "@/config/site";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getAllSummaries } from "@/lib/properties";
import { PageHeader } from "@/components/page-header";
import { PropertyExplorer } from "@/components/property-explorer";
import { EmptyPortfolio } from "@/components/empty-state";

export async function generateMetadata({ params }: PageProps<"/[locale]/immobilien">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return {
    title: t.overview.title,
    description: t.overview.intro,
    alternates: { canonical: `/${locale}/immobilien` },
  };
}

export default async function OverviewPage({ params }: PageProps<"/[locale]/immobilien">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const items = getAllSummaries();

  return (
    <>
      <PageHeader eyebrow={site.tagline} title={t.overview.title} intro={t.overview.intro} />
      <div className="container-page py-12 md:py-16">
        {items.length === 0 ? <EmptyPortfolio locale={locale} /> : <PropertyExplorer items={items} />}
      </div>
    </>
  );
}
