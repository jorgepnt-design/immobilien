import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { contact, isLocale, site } from "@/config/site";
import { getDictionary } from "@/lib/i18n/dictionary";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = { title: "Impressum", robots: { index: false } };

/**
 * Impressum (Anbieterkennzeichnung nach § 5 DDG).
 * Die Angaben stammen aus `contact` in src/config/site.ts. Als Rechtstext bleibt die
 * Seite in allen Sprachfassungen deutsch.
 */
export default async function ImprintPage({ params }: PageProps<"/[locale]/impressum">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);

  const h2 = "heading-display text-2xl text-navy-900";
  const text = "mt-3 text-[0.95rem] leading-[1.8] text-ink/80";

  return (
    <>
      <PageHeader title={t.legal.imprintTitle} />
      <div className="container-page max-w-3xl space-y-10 py-12 md:py-16" lang="de">
        <section>
          <h2 className={h2}>Angaben gemäß § 5 DDG</h2>
          <address className={`${text} not-italic`}>
            <strong className="font-semibold text-navy-900">{contact.company}</strong>
            <br />
            {contact.descriptor}
            <br />
            {contact.street}
            <br />
            {contact.city}
            <br />
            {contact.country}
          </address>
        </section>

        <section>
          <h2 className={h2}>Kontakt</h2>
          <p className={text}>
            E-Mail:{" "}
            <a href={`mailto:${contact.email}`} className="font-medium text-navy-900 underline-offset-4 hover:underline">
              {contact.email}
            </a>
          </p>
        </section>

        <section>
          <h2 className={h2}>Steuernummer</h2>
          <p className={text}>{contact.taxNumber}</p>
        </section>

        <section>
          <h2 className={h2}>Haftung für Inhalte</h2>
          <p className={text}>
            Die Inhalte dieser Website wurden mit Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der
            Inhalte übernehmen wir jedoch keine Gewähr. Die Objektangaben beruhen auf Informationen der Anbieter und auf
            Unterlagen Dritter; sie stellen kein rechtlich bindendes Angebot und keine Anlageberatung dar. Zwischenverkauf
            und Irrtum bleiben vorbehalten. Als Diensteanbieter sind wir nach § 7 Abs. 1 DDG für eigene Inhalte auf diesen
            Seiten nach den allgemeinen Gesetzen verantwortlich.
          </p>
        </section>

        <section>
          <h2 className={h2}>Haftung für Links</h2>
          <p className={text}>
            Diese Website kann Links zu externen Websites Dritter enthalten, auf deren Inhalte wir keinen Einfluss haben.
            Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber verantwortlich. Bei
            Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.
          </p>
        </section>

        <section>
          <h2 className={h2}>Urheberrecht</h2>
          <p className={text}>
            Die auf dieser Website veröffentlichten Inhalte, Texte und Bilder unterliegen dem deutschen Urheberrecht. Jede
            Vervielfältigung, Bearbeitung, Verbreitung oder sonstige Verwertung außerhalb der Grenzen des Urheberrechts
            bedarf der vorherigen schriftlichen Zustimmung von {contact.company}.
          </p>
        </section>

        <p className="border-t border-sand pt-6 text-xs text-stone-warm">
          {site.name} ist ein Angebot von {contact.company}.
        </p>
      </div>
    </>
  );
}
