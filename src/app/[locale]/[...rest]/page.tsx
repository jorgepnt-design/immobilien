import { notFound } from "next/navigation";

/** Fängt unbekannte Pfade ab, damit die gestaltete 404-Seite der jeweiligen Sprache erscheint. */
export default function CatchAll() {
  notFound();
}
