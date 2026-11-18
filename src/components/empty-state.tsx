import Link from "next/link";
import { Building2 } from "lucide-react";
import type { Locale } from "@/config/site";
import { getDictionary } from "@/lib/i18n/dictionary";

/** Leerzustand, solange noch keine Immobilien veröffentlicht sind. */
export function EmptyPortfolio({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  return (
    <div className="card grid place-items-center px-6 py-24 text-center">
      <Building2 size={40} strokeWidth={1.1} className="text-champagne-dark" />
      <h2 className="heading-display mt-6 text-3xl text-navy-900 md:text-4xl">{t.overview.portfolioEmptyTitle}</h2>
      <p className="mt-4 max-w-lg text-sm leading-relaxed text-stone-warm">{t.overview.portfolioEmptyText}</p>
      <Link href={`/${locale}/kontakt`} className="btn btn-dark mt-8">
        {t.home.ctaButton}
      </Link>
    </div>
  );
}
