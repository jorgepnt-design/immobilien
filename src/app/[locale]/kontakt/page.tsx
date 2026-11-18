import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { isLocale, site } from "@/config/site";
import { getDictionary } from "@/lib/i18n/dictionary";
import { PageHeader } from "@/components/page-header";
import { InquiryForm } from "@/components/inquiry-form";

export async function generateMetadata({ params }: PageProps<"/[locale]/kontakt">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return { title: t.contact.title, description: t.contact.intro, alternates: { canonical: `/${locale}/kontakt` } };
}

export default async function ContactPage({ params }: PageProps<"/[locale]/kontakt">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);

  return (
    <>
      <PageHeader eyebrow={site.tagline} title={t.contact.title} intro={t.contact.intro} />
      <div className="container-page grid gap-12 py-12 md:py-16 lg:grid-cols-[1fr_1.6fr]">
        <ul className="space-y-5">
          {t.contact.points.map((point) => (
            <li key={point} className="flex items-start gap-3 text-sm leading-relaxed text-ink/80">
              <ShieldCheck size={20} strokeWidth={1.4} className="mt-0.5 shrink-0 text-champagne-dark" />
              {point}
            </li>
          ))}
        </ul>
        <section aria-labelledby="formular" className="card p-6 md:p-10">
          <h2 id="formular" className="heading-display text-3xl text-navy-900">
            {t.form.title}
          </h2>
          <p className="mb-8 mt-3 text-sm leading-relaxed text-stone-warm">{t.form.intro}</p>
          <InquiryForm />
        </section>
      </div>
    </>
  );
}
