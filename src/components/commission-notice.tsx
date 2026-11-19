/**
 * Provisionshinweis – Wortlaut vom Betreiber vorgegeben.
 * Als Rechtstext bleibt er in allen Sprachfassungen deutsch.
 */
export const COMMISSION_TITLE = "Provisionshinweis";

export const COMMISSION_TEXT = [
  "Die auf dieser Webseite angebotenen Immobilien werden im Rahmen einer professionellen Immobilienvermittlung präsentiert.",
  "Bei erfolgreichem Nachweis oder erfolgreicher Vermittlung eines Kaufvertrages fällt eine Vermittlungsprovision an, sofern eine entsprechende Provisionsvereinbarung besteht. Die Höhe der Provision richtet sich nach dem jeweiligen Immobilienangebot und wird dem Interessenten vor Abschluss einer Provisionsvereinbarung transparent mitgeteilt.",
  "Der Provisionsanspruch entsteht bei Vorliegen der gesetzlichen und vertraglichen Voraussetzungen mit Abschluss des notariellen Kaufvertrages.",
];

/** Kompakte Fassung für Detail- und Kontaktseite. */
export function CommissionNotice({ id = "provisionshinweis" }: { id?: string }) {
  return (
    <section
      aria-labelledby={id}
      lang="de"
      className="rounded-2xl border border-sand bg-vanilla/40 p-6 md:p-8"
    >
      <h2 id={id} className="heading-display text-2xl text-navy-900">
        {COMMISSION_TITLE}
      </h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-ink/80">
        {COMMISSION_TEXT.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>
    </section>
  );
}
