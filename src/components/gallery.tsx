"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import type { PropertyImage } from "@/lib/types";
import { fill } from "@/lib/i18n/dictionary";
import { useI18n } from "./providers";
import { ImagePlaceholder } from "./property-card";

function Lightbox({
  images,
  index,
  onClose,
  onChange,
}: {
  images: PropertyImage[];
  index: number;
  onClose: () => void;
  onChange: (i: number) => void;
}) {
  const { t } = useI18n();
  const count = images.length;
  const go = useCallback((d: number) => onChange((index + d + count) % count), [index, count, onChange]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [go, onClose]);

  const img = images[index];
  const navBtn =
    "absolute top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white text-navy-900 shadow-card transition-colors hover:bg-sky";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={img.alt}
      className="fixed inset-0 z-[80] flex flex-col bg-warmwhite"
    >
      <div className="flex items-center justify-between px-5 py-4 text-sm text-ink/80">
        <span aria-live="polite">{fill(t.detail.galleryCount, { i: index + 1, n: count })}</span>
        <button
          type="button"
          autoFocus
          onClick={onClose}
          aria-label={t.common.close}
          className="grid h-11 w-11 place-items-center rounded-full bg-white text-navy-900 shadow-card hover:bg-sky"
        >
          <X size={22} />
        </button>
      </div>
      <div className="relative flex-1" onClick={onClose}>
        <Image key={img.src} src={img.src} alt={img.alt} fill sizes="100vw" className="object-contain" priority />
        {count > 1 && (
          <>
            <button
              type="button"
              className={`${navBtn} left-3 md:left-6`}
              aria-label={t.detail.galleryPrev}
              onClick={(e) => {
                e.stopPropagation();
                go(-1);
              }}
            >
              <ChevronLeft size={26} />
            </button>
            <button
              type="button"
              className={`${navBtn} right-3 md:right-6`}
              aria-label={t.detail.galleryNext}
              onClick={(e) => {
                e.stopPropagation();
                go(1);
              }}
            >
              <ChevronRight size={26} />
            </button>
          </>
        )}
      </div>
      <p className="px-5 py-4 text-center text-sm text-ink/75">{img.alt}</p>
    </div>
  );
}

/** Große Bildergalerie mit Vollbildansicht. */
export function Gallery({ images }: { images: PropertyImage[] }) {
  const { t } = useI18n();
  const [open, setOpen] = useState<number | null>(null);

  if (images.length === 0) {
    return (
      <div className="relative aspect-[16/9] overflow-hidden rounded-[1.25rem] md:aspect-[21/9]">
        <ImagePlaceholder label={t.card.noImage} />
      </div>
    );
  }

  const [first, ...rest] = images;
  const side = rest.slice(0, 4);
  const tile = (img: PropertyImage, i: number, className: string, sizes: string, priority = false) => (
    <button
      key={img.src}
      type="button"
      onClick={() => setOpen(i)}
      aria-label={`${t.detail.galleryOpen}: ${img.alt}`}
      className={`group relative overflow-hidden bg-sky ${className}`}
    >
      <Image
        src={img.src}
        alt={img.alt}
        fill
        priority={priority}
        sizes={sizes}
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
      />
      <span aria-hidden className="absolute inset-0 bg-navy-950/0 transition-colors group-hover:bg-white/20" />
    </button>
  );

  return (
    <>
      <div
        className={`grid gap-2 overflow-hidden rounded-[1.25rem] ${
          side.length > 0 ? "md:grid-cols-[1.55fr_1fr]" : ""
        }`}
      >
        <div className="relative">
          {tile(
            first,
            0,
            `block w-full ${side.length > 0 ? "aspect-[4/3] md:aspect-auto md:h-[34rem]" : "aspect-[4/3] md:aspect-[21/9]"}`,
            "(min-width: 768px) 60vw, 100vw",
            true,
          )}
          <button
            type="button"
            onClick={() => setOpen(0)}
            className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold tracking-wide text-navy-900 shadow-card backdrop-blur hover:bg-white"
          >
            <Expand size={14} />
            {fill(t.detail.galleryAll, { n: images.length })}
          </button>
        </div>
        {side.length > 0 && (
          <div
            className={`grid gap-2 ${side.length === 1 ? "grid-cols-1" : "grid-cols-2"} ${
              side.length > 2 ? "grid-rows-2" : ""
            } md:h-[34rem]`}
          >
            {side.map((img, i) =>
              tile(
                img,
                i + 1,
                `aspect-[4/3] md:aspect-auto ${side.length === 3 && i === 2 ? "col-span-2" : ""}`,
                "(min-width: 768px) 20vw, 50vw",
              ),
            )}
          </div>
        )}
      </div>
      {open !== null && (
        <Lightbox images={images} index={open} onClose={() => setOpen(null)} onChange={setOpen} />
      )}
    </>
  );
}

/** Kachelraster für Pläne und Dokumente mit Vollbildansicht. */
export function PlanGrid({ images }: { images: PropertyImage[] }) {
  const { t } = useI18n();
  const [open, setOpen] = useState<number | null>(null);
  return (
    <>
      <ul className="grid gap-4 sm:grid-cols-2">
        {images.map((img, i) => (
          <li key={img.src}>
            <button
              type="button"
              onClick={() => setOpen(i)}
              aria-label={`${t.detail.galleryOpen}: ${img.alt}`}
              className="group block w-full overflow-hidden rounded-xl border border-sand bg-white text-left"
            >
              <span className="relative block aspect-[4/3] bg-ivory-dark">
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(min-width: 640px) 320px, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </span>
              <span className="block px-4 py-3 text-sm text-navy-900">{img.alt}</span>
            </button>
          </li>
        ))}
      </ul>
      {open !== null && (
        <Lightbox images={images} index={open} onClose={() => setOpen(null)} onChange={setOpen} />
      )}
    </>
  );
}
