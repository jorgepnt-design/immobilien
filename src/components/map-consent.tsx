"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { useI18n } from "./providers";

/**
 * OpenStreetMap-Karte, die erst nach ausdrücklichem Klick geladen wird
 * (vorher findet keine Datenübertragung an Dritte statt).
 */
export function MapConsent({
  center,
  title,
}: {
  center: { lat: number; lng: number; zoom: number };
  title: string;
}) {
  const { t } = useI18n();
  const [loaded, setLoaded] = useState(false);

  const lonSpan = (360 / 2 ** center.zoom) * 1.6;
  const latSpan = lonSpan * 0.55;
  const bbox = [
    center.lng - lonSpan / 2,
    center.lat - latSpan / 2,
    center.lng + lonSpan / 2,
    center.lat + latSpan / 2,
  ]
    .map((n) => n.toFixed(5))
    .join(",");
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik`;

  return (
    <div>
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-sand bg-ivory-dark md:aspect-[16/8]">
        {loaded ? (
          <iframe
            title={title}
            src={src}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center p-6 text-center">
            <div className="flex max-w-sm flex-col items-center">
              <MapPin size={30} strokeWidth={1.3} className="text-champagne-dark" />
              <p className="mt-3 text-xs leading-relaxed text-stone-warm">{t.detail.mapConsent}</p>
              <button type="button" className="btn btn-dark mt-5" onClick={() => setLoaded(true)}>
                {t.detail.mapLoad}
              </button>
            </div>
          </div>
        )}
      </div>
      <p className="mt-3 text-xs text-stone-warm">{t.detail.mapApprox}</p>
    </div>
  );
}
