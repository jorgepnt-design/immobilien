"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Bookmark, FileText, Menu, Scale, X } from "lucide-react";
import { locales, site } from "@/config/site";
import { useI18n, useLists } from "./providers";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-3 ${className}`}>
      <span
        aria-hidden
        className="grid h-9 w-9 place-items-center rounded-full border border-champagne/70 font-display text-lg leading-none text-champagne"
      >
        {site.name.charAt(0)}
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.15rem] tracking-[0.14em] uppercase">{site.name}</span>
        <span className="mt-1 text-[0.58rem] font-medium tracking-[0.34em] uppercase text-champagne">
          {site.tagline}
        </span>
      </span>
    </span>
  );
}

function CountBadge({ n }: { n: number }) {
  if (n === 0) return null;
  return (
    <span className="absolute -right-1 -top-1 grid h-[1.05rem] min-w-[1.05rem] place-items-center rounded-full bg-champagne px-1 text-[0.62rem] font-bold text-navy-950">
      {n}
    </span>
  );
}

export function Header() {
  const { t, href, locale } = useI18n();
  const pathname = usePathname();
  const lists = useLists();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const nav = [
    { path: "/immobilien", label: t.nav.properties },
    { path: "/vergleich", label: t.nav.compare },
    { path: "/dossier", label: t.nav.dossier },
    { path: "/kontakt", label: t.nav.contact },
  ];
  const tools = [
    { path: "/merkliste", label: t.nav.watchlist, icon: Bookmark, n: lists.watch.length },
    { path: "/vergleich", label: t.nav.compare, icon: Scale, n: lists.compare.length },
    { path: "/dossier", label: t.nav.dossier, icon: FileText, n: lists.dossier.length },
  ];
  const isActive = (path: string) => pathname.startsWith(href(path));
  const switchPath = (l: string) => {
    const rest = pathname.replace(new RegExp(`^/${locale}(?=/|$)`), "");
    return `/${l}${rest}`;
  };

  return (
    <header className="no-print sticky top-0 z-50 border-b border-white/10 bg-navy-900/95 text-ivory backdrop-blur-md">
      <div className="container-page flex h-[4.5rem] items-center justify-between gap-6">
        <Link href={href("/")} aria-label={site.name} onClick={() => setOpen(false)}>
          <Logo />
        </Link>

        <nav aria-label={t.nav.menu} className="hidden items-center gap-8 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.path}
              href={href(item.path)}
              aria-current={isActive(item.path) ? "page" : undefined}
              className={`relative py-2 text-[0.8rem] font-medium tracking-[0.12em] uppercase transition-colors hover:text-champagne ${
                isActive(item.path) ? "text-champagne" : "text-ivory/85"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          {tools.map(({ path, label, icon: Icon, n }) => (
            <Link
              key={path}
              href={href(path)}
              aria-label={n > 0 ? `${label} (${n})` : label}
              title={label}
              onClick={() => setOpen(false)}
              className="relative hidden h-10 w-10 place-items-center rounded-full text-ivory/85 transition-colors hover:bg-white/10 hover:text-champagne sm:grid"
            >
              <Icon size={18} strokeWidth={1.6} />
              <CountBadge n={n} />
            </Link>
          ))}

          <div
            role="group"
            aria-label={t.nav.language}
            className="ml-2 hidden items-center gap-1 border-l border-white/15 pl-3 text-[0.72rem] font-semibold tracking-widest uppercase sm:flex"
          >
            {locales.map((l) => (
              <Link
                key={l}
                href={switchPath(l)}
                hrefLang={l}
                aria-current={l === locale ? "true" : undefined}
                className={`rounded px-1.5 py-1 transition-colors hover:text-champagne ${
                  l === locale ? "text-champagne" : "text-ivory/60"
                }`}
              >
                {l}
              </Link>
            ))}
          </div>

          <button
            type="button"
            className="ml-1 grid h-10 w-10 place-items-center rounded-full hover:bg-white/10 lg:hidden"
            aria-label={open ? t.common.close : t.nav.menu}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="absolute inset-x-0 top-full z-40 h-[calc(100dvh-4.5rem)] overflow-y-auto bg-navy-900 lg:hidden">
          <nav aria-label={t.nav.menu} className="container-page flex flex-col py-6">
            {[
              { path: "/", label: t.nav.home, n: 0 },
              { path: "/immobilien", label: t.nav.properties, n: 0 },
              { path: "/merkliste", label: t.nav.watchlist, n: lists.watch.length },
              { path: "/vergleich", label: t.nav.compare, n: lists.compare.length },
              { path: "/dossier", label: t.nav.dossier, n: lists.dossier.length },
              { path: "/kontakt", label: t.nav.contact, n: 0 },
            ].map((item) => (
              <Link
                key={item.path}
                href={href(item.path)}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between border-b border-white/10 py-4 font-display text-2xl text-ivory"
              >
                {item.label}
                {item.n > 0 && (
                  <span className="grid h-6 min-w-6 place-items-center rounded-full bg-champagne px-1.5 font-sans text-xs font-bold text-navy-950">
                    {item.n}
                  </span>
                )}
              </Link>
            ))}
            <div className="mt-8 flex gap-2 text-sm font-semibold tracking-widest uppercase sm:hidden">
              {locales.map((l) => (
                <Link
                  key={l}
                  href={switchPath(l)}
                  hrefLang={l}
                  onClick={() => setOpen(false)}
                  className={`rounded-full border px-4 py-2 ${
                    l === locale ? "border-champagne text-champagne" : "border-white/20 text-ivory/70"
                  }`}
                >
                  {l}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
