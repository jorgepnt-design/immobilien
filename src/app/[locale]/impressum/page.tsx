import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TriangleAlert } from "lucide-react";
import { isLocale } from "@/config/site";
import { getDictionary } from "@/lib/i18n/dictionary";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = { title: "Impressum", robots: { index: false } };

/**
 * Platzhalter: Die Pflichtangaben nach § 5 DDG müssen vor der Veröffentlichung
 * vom Betreiber eingetragen werden (siehe README, Abschnitt „Vor dem Livegang“).
 */
export default async function ImprintPage({ params }: PageProps<"/[locale]/impressum">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const fields = [
    "Name / Firma und Rechtsform",
    "Anschrift",
    "Vertretungsberechtigte Person",
    "Kontakt (Telefon, E-Mail)",
    "Registergericht und Registernummer",
    "Umsatzsteuer-Identifikationsnummer",
    "Erlaubnis nach § 34c GewO und zuständige Aufsichtsbehörde",
  ];

  return (
    <>
      <PageHeader title={t.legal.imprintTitle} />
      <div className="container-page max-w-3xl py-12 md:py-16">
        <p className="flex items-start gap-3 rounded-xl border border-amber-700/30 bg-amber-50 px-5 py-4 text-sm leading-relaxed text-amber-900">
          <TriangleAlert size={18} className="mt-0.5 shrink-0" />
          {t.legal.placeholder}
        </p>
        <dl className="mt-8 divide-y divide-sand border-y border-sand">
          {fields.map((f) => (
            <div key={f} className="grid gap-2 py-4 sm:grid-cols-2">
              <dt className="text-sm text-stone-warm">{f}</dt>
              <dd className="text-sm text-ink/50">[bitte ergänzen]</dd>
            </div>
          ))}
        </dl>
      </div>
    </>
  );
}
