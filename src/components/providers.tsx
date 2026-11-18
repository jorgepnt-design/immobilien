"use client";

import { createContext, useContext, useMemo, useSyncExternalStore } from "react";
import type { Locale } from "@/config/site";
import type { Dictionary } from "@/lib/i18n/dictionary";

/* ---------- Sprache ---------- */

interface I18n {
  locale: Locale;
  t: Dictionary;
  /** Baut einen Pfad mit Sprachpräfix, z. B. href("/immobilien") → "/de/immobilien" */
  href: (path: string) => string;
}

const I18nContext = createContext<I18n | null>(null);

export function I18nProvider({
  locale,
  dict,
  children,
}: {
  locale: Locale;
  dict: Dictionary;
  children: React.ReactNode;
}) {
  const value = useMemo<I18n>(
    () => ({ locale, t: dict, href: (p) => `/${locale}${p === "/" ? "" : p}` }),
    [locale, dict],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18n {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n muss innerhalb von I18nProvider verwendet werden");
  return ctx;
}

/* ---------- Merkliste, Vergleich, Dossier (nur im Browser gespeichert) ---------- */

export type ListName = "watch" | "compare" | "dossier";
type Lists = Record<ListName, string[]>;

const STORAGE_KEY = "immobilien-listen-v1";
export const COMPARE_MAX = 4;
const EMPTY: Lists = { watch: [], compare: [], dossier: [] };

let state: Lists = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function read(): Lists {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<Lists>;
    const clean = (v: unknown) =>
      Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
    return {
      watch: clean(parsed.watch),
      compare: clean(parsed.compare).slice(0, COMPARE_MAX),
      dossier: clean(parsed.dossier),
    };
  } catch {
    return EMPTY;
  }
}

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      state = read();
      emit();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): Lists {
  if (!loaded) {
    state = read();
    loaded = true;
  }
  return state;
}

function write(next: Lists) {
  state = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* Speicher nicht verfügbar – Listen gelten dann nur für diese Sitzung */
  }
  emit();
}

/** Schaltet ein Objekt in einer Liste um. Gibt false zurück, wenn der Vergleich voll ist. */
export function toggleInList(list: ListName, id: string): boolean {
  const current = getSnapshot();
  const has = current[list].includes(id);
  if (!has && list === "compare" && current.compare.length >= COMPARE_MAX) return false;
  write({
    ...current,
    [list]: has ? current[list].filter((x) => x !== id) : [...current[list], id],
  });
  return true;
}

export function clearList(list: ListName) {
  write({ ...getSnapshot(), [list]: [] });
}

export function useLists(): Lists {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}

/** true, sobald die Listen aus dem Browser-Speicher gelesen wurden (nach der Hydration). */
export function useListsReady(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
