import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TriangleAlert } from "lucide-react";
import { contact, isLocale } from "@/config/site";
import { getDictionary } from "@/lib/i18n/dictionary";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = { title: "Datenschutz", robots: { index: false } };

/**
 * Beschreibt die tatsächliche Datenverarbeitung dieser Website.
 * Verantwortlicher, Hosting- und E-Mail-Dienstleister sind vor der Veröffentlichung
 * zu ergänzen und rechtlich prüfen zu lassen.
 */
export default async function PrivacyPage({ params }: PageProps<"/[locale]/datenschutz">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);

  const sections = [
    {
      title: "Verantwortlicher",
      text: `${contact.company} – ${contact.descriptor}, ${contact.street}, ${contact.city}, ${contact.country}. E-Mail: ${contact.email}. [Vertretungsberechtigte Person – bitte ergänzen]`,
    },
    {
      title: "Aufruf der Website",
      text: "Beim Aufruf der Website verarbeitet der Hosting-Anbieter technisch notwendige Verbindungsdaten (u. a. IP-Adresse, Zeitpunkt, aufgerufene Seite), um die Seite auszuliefern und die Sicherheit des Betriebs zu gewährleisten. [Hosting-Anbieter und Auftragsverarbeitung – bitte ergänzen]",
    },
    {
      title: "Exposé-Anfrage und Kontakt",
      text: "Wenn Sie ein Exposé anfordern oder uns schreiben, verarbeiten wir die von Ihnen angegebenen Daten (Vor- und Nachname, optional Unternehmen, E-Mail-Adresse, Telefonnummer, Nachricht, Objekt-ID sowie Zeitpunkt und abgegebene Bestätigungen) zur Bearbeitung Ihrer Anfrage und zum Nachweis der Vermittlungstätigkeit. Die Übermittlung erfolgt verschlüsselt; die Angaben werden per E-Mail zugestellt und nicht auf dieser Website gespeichert. Sie erhalten eine Eingangsbestätigung per E-Mail. [E-Mail-Dienstleister, Rechtsgrundlage und Speicherdauer – bitte ergänzen]",
    },
    {
      title: "Merkliste, Vergleich und Dossier",
      text: "Merkliste, Objektvergleich und Dossier werden ausschließlich lokal in Ihrem Browser gespeichert (Local Storage). Diese Daten werden nicht an uns übertragen. Sie können sie jederzeit über die jeweilige Seite oder die Einstellungen Ihres Browsers löschen.",
    },
    {
      title: "Karten",
      text: "Karten von OpenStreetMap werden erst geladen, wenn Sie dies ausdrücklich per Klick auslösen. Erst dann werden Daten (u. a. Ihre IP-Adresse) an die OpenStreetMap Foundation übertragen.",
    },
    {
      title: "Cookies und Tracking",
      text: "Diese Website setzt keine Tracking- oder Marketing-Cookies ein und verwendet keine Analyse-Dienste. Schriftarten werden vom eigenen Server ausgeliefert.",
    },
    {
      title: "Ihre Rechte",
      text: "Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch sowie das Recht, sich bei einer Aufsichtsbehörde zu beschweren. Eine erteilte Einwilligung können Sie jederzeit mit Wirkung für die Zukunft widerrufen.",
    },
  ];

  return (
    <>
      <PageHeader title={t.legal.privacyTitle} />
      <div className="container-page max-w-3xl py-12 md:py-16">
        <p className="flex items-start gap-3 rounded-xl border border-vanilla bg-vanilla px-5 py-4 text-sm leading-relaxed text-navy-900">
          <TriangleAlert size={18} className="mt-0.5 shrink-0" />
          {t.legal.placeholder}
        </p>
        <div className="mt-10 space-y-9">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="heading-display text-2xl text-navy-900">{s.title}</h2>
              <p className="mt-3 text-[0.95rem] leading-[1.8] text-ink/80">{s.text}</p>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
