import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, site } from "@/config/site";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getAllSummaries } from "@/lib/properties";
import { PageHeader } from "@/components/page-header";
import { WatchlistView } from "@/components/list-views";

export async function generateMetadata({ params }: PageProps<"/[locale]/merkliste">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return { title: t.watchlist.title, description: t.watchlist.intro, robots: { index: false } };
}

export default async function Page({ params }: PageProps<"/[locale]/merkliste">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  return (
    <>
      <PageHeader eyebrow={site.tagline} title={t.watchlist.title} intro={t.watchlist.intro} />
      <div className="container-page py-12 md:py-16">
        <WatchlistView items={getAllSummaries()} />
      </div>
    </>
  );
}
