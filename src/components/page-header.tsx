/** Einheitlicher dunkler Seitenkopf für Unterseiten. */
export function PageHeader({ eyebrow, title, intro }: { eyebrow?: string; title: string; intro?: string }) {
  return (
    <section className="bg-navy-900 text-ivory">
      <div className="container-page py-14 md:py-20">
        {eyebrow && <p className="eyebrow !text-champagne">{eyebrow}</p>}
        <h1 className="heading-display mt-3 text-4xl md:text-6xl">{title}</h1>
        {intro && <p className="mt-5 max-w-2xl text-base leading-relaxed text-ivory/75">{intro}</p>}
      </div>
    </section>
  );
}
