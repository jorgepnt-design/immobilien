import Link from "next/link";
import { contact, site, type Locale } from "@/config/site";
import { getDictionary } from "@/lib/i18n/dictionary";
import { Logo } from "./header";

export function Footer({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const href = (p: string) => `/${locale}${p}`;
  const nav = [
    { path: "/immobilien", label: t.nav.properties },
    { path: "/merkliste", label: t.nav.watchlist },
    { path: "/vergleich", label: t.nav.compare },
    { path: "/dossier", label: t.nav.dossier },
    { path: "/kontakt", label: t.nav.contact },
  ];
  const legal = [
    { path: "/impressum", label: t.footer.imprint },
    { path: "/datenschutz", label: t.footer.privacy },
    { path: "/impressum#provisionshinweis", label: "Provisionshinweis" },
  ];
  const linkClass = "text-sm text-ink/70 transition-colors hover:text-accent";

  return (
    <footer className="no-print mt-24 border-t border-sand bg-cloud text-navy-900">
      <div className="container-page grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-ink/70">{t.footer.claim}</p>
          <address className="mt-6 text-sm not-italic leading-relaxed text-ink/70">
            <span className="font-semibold text-navy-900">{contact.company}</span>
            <br />
            {contact.descriptor}
            <br />
            {contact.street}, {contact.city}
            <br />
            <a href={`mailto:${contact.email}`} className="transition-colors hover:text-accent">
              {contact.email}
            </a>
          </address>
        </div>
        <nav aria-label={t.footer.navigation}>
          <h2 className="eyebrow">{t.footer.navigation}</h2>
          <ul className="mt-5 space-y-3">
            {nav.map((i) => (
              <li key={i.path}>
                <Link href={href(i.path)} className={linkClass}>
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label={t.footer.legal}>
          <h2 className="eyebrow">{t.footer.legal}</h2>
          <ul className="mt-5 space-y-3">
            {legal.map((i) => (
              <li key={i.path}>
                <Link href={href(i.path)} className={linkClass}>
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-sand">
        <div className="container-page flex flex-col gap-3 py-6 text-xs leading-relaxed text-stone-warm md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}. {t.footer.rights}
          </p>
          <p className="max-w-2xl md:text-right">{t.footer.disclaimer}</p>
        </div>
      </div>
    </footer>
  );
}
