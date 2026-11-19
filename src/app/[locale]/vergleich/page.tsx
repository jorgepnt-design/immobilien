import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/config/site";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getAllSummaries } from "@/lib/properties";
import { PageHeader } from "@/components/page-header";
import { CompareView } from "@/components/list-views";

export async function generateMetadata({ params }: PageProps<"/[locale]/vergleich">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return { title: t.compare.title, description: t.compare.intro, robots: { index: false } };
}

export default async function Page({ params }: PageProps<"/[locale]/vergleich">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  return (
    <>
      <PageHeader title={t.compare.title} intro={t.compare.intro} />
      <div className="container-page py-12 md:py-16">
        <CompareView items={getAllSummaries()} />
      </div>
    </>
  );
}
