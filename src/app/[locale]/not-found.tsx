"use client";

import Link from "next/link";
import { useI18n } from "@/components/providers";

export default function NotFound() {
  const { t, href } = useI18n();
  return (
    <div className="container-page grid min-h-[60vh] place-items-center py-24 text-center">
      <div>
        <p className="heading-display text-7xl text-champagne-dark">404</p>
        <h1 className="heading-display mt-4 text-4xl text-navy-900">{t.notFound.title}</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-stone-warm">{t.notFound.text}</p>
        <Link href={href("/immobilien")} className="btn btn-dark mt-8">
          {t.notFound.back}
        </Link>
      </div>
    </div>
  );
}
