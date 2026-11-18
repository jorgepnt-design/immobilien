"use client";

import { useEffect, useState } from "react";
import { Bookmark, FileText, Scale } from "lucide-react";
import { toggleInList, useI18n, useLists, type ListName } from "./providers";

const ICONS = { watch: Bookmark, compare: Scale, dossier: FileText } as const;

function useListButton(list: ListName, id: string) {
  const { t } = useI18n();
  const lists = useLists();
  const active = lists[list].includes(id);
  const [full, setFull] = useState(false);

  useEffect(() => {
    if (!full) return;
    const timer = setTimeout(() => setFull(false), 3200);
    return () => clearTimeout(timer);
  }, [full]);

  const labels = {
    watch: [t.actions.watchAdd, t.actions.watchRemove, t.actions.watchShort, t.actions.watchActive],
    compare: [t.actions.compareAdd, t.actions.compareRemove, t.actions.compareShort, t.actions.compareActive],
    dossier: [t.actions.dossierAdd, t.actions.dossierRemove, t.actions.dossierShort, t.actions.dossierActive],
  }[list];

  return {
    active,
    full,
    label: active ? labels[1] : labels[0],
    short: active ? labels[3] : labels[2],
    fullText: t.actions.compareFull,
    onClick: (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!toggleInList(list, id)) setFull(true);
    },
  };
}

/** Runde Symbol-Schaltfläche, z. B. auf Immobilienkarten. */
export function ListIconButton({ list, id }: { list: ListName; id: string }) {
  const b = useListButton(list, id);
  const Icon = ICONS[list];
  return (
    <span className="relative">
      <button
        type="button"
        onClick={b.onClick}
        aria-pressed={b.active}
        aria-label={b.label}
        title={b.label}
        className={`grid h-9 w-9 place-items-center rounded-full border backdrop-blur transition-colors ${
          b.active
            ? "border-champagne bg-champagne text-navy-950"
            : "border-white/40 bg-navy-950/45 text-white hover:bg-navy-950/70"
        }`}
      >
        <Icon size={16} strokeWidth={1.8} fill={b.active && list === "watch" ? "currentColor" : "none"} />
      </button>
      {b.full && (
        <span
          role="status"
          className="absolute right-0 top-11 z-20 w-52 rounded-lg bg-navy-950 px-3 py-2 text-xs leading-snug text-ivory shadow-lift"
        >
          {b.fullText}
        </span>
      )}
    </span>
  );
}

/** Schaltfläche mit Text, z. B. auf der Detailseite. */
export function ListTextButton({ list, id }: { list: ListName; id: string }) {
  const b = useListButton(list, id);
  const Icon = ICONS[list];
  return (
    <span className="relative">
      <button
        type="button"
        onClick={b.onClick}
        aria-pressed={b.active}
        aria-label={b.label}
        className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-[0.8rem] font-semibold transition-colors ${
          b.active
            ? "border-champagne-dark bg-champagne/15 text-navy-900"
            : "border-sand bg-white text-navy-800 hover:border-navy-800"
        }`}
      >
        <Icon size={15} strokeWidth={1.8} fill={b.active && list === "watch" ? "currentColor" : "none"} />
        {b.short}
      </button>
      {b.full && (
        <span
          role="status"
          className="absolute left-0 top-12 z-20 w-56 rounded-lg bg-navy-950 px-3 py-2 text-xs leading-snug text-ivory shadow-lift"
        >
          {b.fullText}
        </span>
      )}
    </span>
  );
}
