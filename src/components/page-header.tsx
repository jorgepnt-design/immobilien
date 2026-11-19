/** Einheitlicher dunkler Seitenkopf für Unterseiten. */
export function PageHeader({ eyebrow, title, intro }: { eyebrow?: string; title: string; intro?: string }) {
  return (
    <section className="border-b border-sand bg-cloud text-navy-900">
      <div className="container-page py-14 md:py-20">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="heading-display mt-3 text-4xl md:text-5xl">{title}</h1>
        {intro && <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink/75">{intro}</p>}
      </div>
    </section>
  );
}
