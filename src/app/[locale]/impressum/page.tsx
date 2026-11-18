import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TriangleAlert } from "lucide-react";
import { contact, isLocale } from "@/config/site";
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
  const todo = "[bitte ergänzen]";
  const fields: [string, string][] = [
    ["Name / Firma und Rechtsform", `${contact.company} – ${contact.descriptor} (Rechtsform ${todo})`],
    ["Anschrift", `${contact.street}, ${contact.city}, ${contact.country}`],
    ["Vertretungsberechtigte Person", todo],
    ["Kontakt", `E-Mail: ${contact.email} · Telefon ${todo}`],
    ["Registergericht und Registernummer", todo],
    ["Umsatzsteuer-Identifikationsnummer", todo],
    ["Erlaubnis nach § 34c GewO und zuständige Aufsichtsbehörde", todo],
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
          {fields.map(([label, value]) => (
            <div key={label} className="grid gap-2 py-4 sm:grid-cols-2">
              <dt className="text-sm text-stone-warm">{label}</dt>
              <dd className={`text-sm ${value === todo ? "text-ink/50" : "text-navy-900"}`}>{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </>
  );
}
