import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/config/site";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getAllProperties, toSummary } from "@/lib/properties";
import { PageHeader } from "@/components/page-header";
import { DossierView, type DossierItem } from "@/components/list-views";

export async function generateMetadata({ params }: PageProps<"/[locale]/dossier">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return { title: t.dossier.title, description: t.dossier.intro, robots: { index: false } };
}

export default async function DossierPage({ params }: PageProps<"/[locale]/dossier">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const items: DossierItem[] = getAllProperties().map((p) => ({
    ...toSummary(p),
    keyFacts: p.keyFacts,
    highlights: p.highlights,
    dataNotes: p.dataNotes,
    intro: p.description[0] ?? p.teaser,
  }));

  return (
    <>
      <PageHeader title={t.dossier.title} intro={t.dossier.intro} />
      <div className="container-page py-12 md:py-16">
        <DossierView items={items} />
      </div>
    </>
  );
}
