# Exklusive Immobilien – Investmentportal

Präsentationsplattform für ausgewählte Wohn-, Gewerbe- und Entwicklungsimmobilien. Zielgruppe sind professionelle Investoren, Projektentwickler, Bauträger und Family Offices.

**Technik:** Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Framer Motion · Lucide Icons · jsPDF. Keine Datenbank – jede Immobilie ist eine JSON-Datei. Alle Seiten werden beim Build statisch erzeugt; nur die Exposé-Anfrage nutzt eine Serverfunktion.

## Funktionen

| Bereich | Stand |
| --- | --- |
| Startseite mit Hero, Suche und Portfolio-Kennzahlen (aus den Daten berechnet) | fertig |
| Immobilienübersicht mit kombinierbaren Filtern, Freitextsuche, Sortierung, verlinkbaren Filter-URLs | fertig |
| Detailseite je Objekt (Galerie mit Vollbild, Eckdaten, Potenzial, Flächen, Rendite mit Formel, Baurecht, Energie, Standort, Dokumente, Datenstand, ähnliche Objekte) | fertig |
| Merkliste, Vergleich (max. 4), Investment-Dossier mit PDF-Export | fertig (Speicherung im Browser) |
| Zweistufige Vermarktung: anonymisiertes Kurzexposé öffentlich, Formular „Vollständiges Exposé anfordern“ | fertig – E-Mail-Versand über Resend optional, sonst vorbereitete E-Mail im Programm des Besuchers |
| Sprachen Deutsch (Standard), Englisch, Portugiesisch | Oberfläche vollständig übersetzt; **Objekttexte derzeit nur Deutsch** |
| SEO: Metadaten, Open Graph, JSON-LD, Sitemap, robots.txt | fertig |
| Geschützter Investorenbereich | **nicht umgesetzt** – Konzept siehe unten |
| Administrationsbereich | **nicht umgesetzt** – Konzept siehe unten |
| Impressum und Datenschutz | **Platzhalter** – vor dem Livegang ergänzen |

## Installation

Voraussetzung: Node.js 20.9 oder neuer.

```bash
npm install
```

```bash
cp .env.example .env.local
```

## Entwicklungsserver

```bash
npm run dev
```

Die Seite läuft unter http://localhost:3000 und leitet auf `/de` weiter.

Weitere Befehle: `npm run build` (Produktions-Build), `npm run start` (Build lokal ausliefern), `npm run lint`.

## Umgebungsvariablen

| Variable | Zweck |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Öffentliche Adresse der Website, z. B. `https://www.beispiel.de` (für Sitemap, Canonical, Open Graph) |
| `NEXT_PUBLIC_SITE_NAME` | Name im Logo, Titel und PDF (Standard: „Exklusive Immobilien“) |
| `RESEND_API_KEY`, `INQUIRY_TO_EMAIL`, `INQUIRY_FROM_EMAIL` | optional: Versand der Exposé-Anfragen über [Resend](https://resend.com) |

Die Kontaktdaten des Betreibers stehen in `src/config/site.ts` (`contact`).

## Neue Immobilie hinzufügen

1. Neue Datei `data/properties/<slug>.json` anlegen. Am einfachsten eine vorhandene Datei kopieren. Der Dateiname ist frei, `slug` bestimmt die URL (`/de/immobilien/<slug>`).
2. Eine eindeutige `id` vergeben (Format `EI-JJJJ-NNN`). Doppelte IDs oder Slugs brechen den Build mit einer klaren Fehlermeldung ab.
3. Bilder ablegen (siehe nächster Abschnitt) und unter `images` eintragen.
4. Committen und pushen – Vercel baut die Seite neu.

Das vollständige Datenmodell steht kommentiert in `src/lib/types.ts`. Die wichtigsten Felder:

| Feld | Bedeutung |
| --- | --- |
| `status` | `verfuegbar`, `reserviert`, `verkauft` (verkaufte Objekte zählen nicht in die Kennzahlen) |
| `type` | Objektart, z. B. `mehrfamilienhaus`, `gewerbe`, `mischobjekt`, `entwicklungsprojekt`, `hotel`, `grundstueck` |
| `investmentType` | `bestand`, `neubau`, `sanierung`, `projektentwicklung` |
| `price` | `amount` (Zahl oder `null`), `mode`: `festpreis`, `auf-anfrage`, `gebotsverfahren` |
| `areas` | `plot`, `living`, `usable`, `commercial`, `gfa` – jeweils in m², optional `approx`, `planned`, `note` |
| `keyFacts`, `planning`, `energy`, `economics` | Listen aus `label`, `value`, `evidence`, optional `note` |
| `yield` | Nur angeben, wenn belastbar berechenbar – immer mit `formula`, `basis` und `caveat` |
| `dataNotes` | Widersprüche, fehlende Angaben, offene Punkte |
| `location` | `city` und `district` nur grob (siehe Anonymisierung); Adressen werden nie eingetragen |

**Kennzeichnung der Angaben (`evidence`):** `fakt` (durch Unterlagen belegt), `anbieter` (Angabe aus dem Exposé), `potenzial`, `annahme`, `berechnet`. Fehlende Werte werden weggelassen oder als „Nicht angegeben“ eingetragen – nichts wird ergänzt, was nicht im Exposé steht.

Preise ändern, Status ändern, Objekt archivieren: jeweils das Feld in der JSON-Datei anpassen bzw. die Datei löschen oder mit `_` am Anfang umbenennen (Dateien mit `_` werden ignoriert).

## Bilder und Exposés

- Bilder liegen unter `public/images/objekte/<Nummer>/`, empfohlen als JPG mit maximal 1800 px Kantenlänge. Next.js liefert sie automatisch in passender Größe als AVIF/WebP aus und lädt sie verzögert.
- Im Eintrag `images` Breite und Höhe in Pixeln angeben; `kind` ist `foto` (Galerie) oder `plan` (Abschnitt „Grundrisse und Dokumente“). Das erste Foto ist das Titelbild der Karte.
- Hat ein Objekt keine Bilder, erscheint ein neutral gestalteter Platzhalter „Bildmaterial auf Anfrage“.
- Die Startseite verwendet bewusst kein Objektfoto, sondern ein abstraktes Linienmuster.
- **Exposés:** Original-Exposés werden nicht veröffentlicht (`exposeDownload` bleibt `null`).

### Anonymisierung und Vertraulichkeit

Die Website zeigt ausschließlich **anonymisierte Kurzexposés**. Ziel: Ein Besucher soll weder das konkrete Objekt noch den Eigentümer ermitteln können.

Regeln für jedes Objekt:

- **Titel und URL neutral** – keine Straßen-, Firmen-, Projekt- oder Stadtteilnamen (`title`, `slug`).
- **Lage grob** – `city` ist eine Stadt oder Region, `district` eine neutrale Lagebeschreibung („verkehrsgünstige Gewerbelage“). Keine Stadtteile bei markanten Objekten, keine Entfernungsangaben, aus denen sich der Standort errechnen lässt.
- **Karte** – `mapCenter` ist die Mitte der Stadt bzw. Region mit `zoom` ≤ 10, nie die Objektposition. Es wird kein Marker gesetzt.
- **Keine** Flurstücke, Aktenzeichen, Namen von Eigentümern, Mietern, Antragstellern, Gutachtern oder Vermittlern Dritter, keine exakten Datumsangaben behördlicher Bescheide.
- **Kennzahlen** – markante Einzelwerte als „ca.“ runden; Preise bleiben unverändert.
- **Bilder** – nur Innenaufnahmen ohne Schilder, Logos, Kennzeichen, Personen oder Ausblicke. Keine Außen- und Luftaufnahmen, keine Lagepläne. Ablage unter `public/images/objekte/<laufende Nummer>/01.jpg` (neutrale Namen, ohne EXIF). Im Zweifel kein Bild – die Seite zeigt dann „Bildmaterial auf Anfrage“.
- **Stufe 2** – Adresse, Original-Exposé, Fotos und Unterlagen werden nie auf der Website oder im Repository abgelegt, sondern nach Prüfung der Anfrage manuell versendet.

Dieses Repository und alles unter `public/` und `data/properties/` ist öffentlich einsehbar. `data/private/` (Zuordnung Objekt-ID ↔ Adresse, zurückgehaltene Bilder) und `.env*` sind per `.gitignore` ausgeschlossen.

**Achtung Versionsverlauf:** Frühere Commits enthalten die nicht anonymisierten Fassungen (Titel, Stadtteile, Außenaufnahmen). Solange das Repository öffentlich ist, sind sie dort abrufbar – Repository auf „privat“ stellen oder den Verlauf neu aufsetzen.

### Exposé-Anfrage und Nachweis

Das Formular sendet an `/api/expose-anfrage`. Mit `RESEND_API_KEY`, `INQUIRY_TO_EMAIL` und `INQUIRY_FROM_EMAIL` geht die Anfrage per E-Mail an den Vermittler, der Anfragende erhält eine Eingangsbestätigung; beide E-Mails enthalten Objekt-ID, Zeitstempel und die abgegebenen Bestätigungen. Ohne diese Variablen öffnet das Formular eine vollständig vorbereitete E-Mail im Programm des Besuchers.

Die Bestätigung im Formular dokumentiert die Kenntnis der Vermittlertätigkeit, ist aber **kein Maklervertrag**. Provisionsvereinbarungen (bei Wohnimmobilien in Textform, mit Widerrufsbelehrung für Verbraucher und den gesetzlichen Regeln zur Teilung der Provision) sind gesondert und anwaltlich geprüft zu schließen.

## Mehrsprachigkeit

- Sprachen stehen in `src/config/site.ts`, Oberflächentexte in `src/lib/i18n/dictionaries/{de,en,pt}.ts`. TypeScript meldet fehlende Schlüssel.
- Jede Seite existiert unter `/de/…`, `/en/…`, `/pt/…`; Aufrufe ohne Präfix werden auf Deutsch umgeleitet (`src/proxy.ts`).
- Objektbezeichnungen, Adressen und Kennzahlen bleiben in allen Sprachen unverändert. Die Fließtexte der Objekte sind derzeit nur Deutsch; auf englischen und portugiesischen Detailseiten steht ein entsprechender Hinweis. Für übersetzte Objekttexte kann das Datenmodell später um sprachabhängige Felder erweitert werden.

## Veröffentlichung auf Vercel

1. Auf [vercel.com](https://vercel.com) „Add New → Project“ wählen und das Repository `jorgepnt-design/immobilien` importieren. Das Framework wird erkannt, es sind keine Build-Einstellungen nötig.
2. Unter „Environment Variables“ die Variablen aus `.env.example` eintragen.
3. Deploy auslösen. Jeder Push auf `main` veröffentlicht automatisch; Pull Requests erhalten eine Vorschau-URL.
4. Eigene Domain unter „Settings → Domains“ verbinden und `NEXT_PUBLIC_SITE_URL` darauf setzen.

### Vor dem Livegang

- [ ] Impressum (`src/app/[locale]/impressum/page.tsx`) und Datenschutzhinweise (`…/datenschutz/page.tsx`) ausfüllen und rechtlich prüfen lassen
- [ ] Freigabe der Eigentümer bzw. Auftraggeber für die Veröffentlichung jedes Objekts und der Fotos einholen
- [ ] Name und Logo festlegen (`NEXT_PUBLIC_SITE_NAME`)

## Projektstruktur

```
data/properties/          Objektdaten (eine JSON-Datei pro Immobilie)
public/images/            Bilder
src/app/[locale]/         Seiten: Start, immobilien, immobilien/[slug], merkliste, vergleich, dossier, kontakt
src/components/           Oberflächen-Komponenten
src/config/site.ts        Name, URL, Sprachen
src/lib/                  Datenmodell, Laden der Objekte, Formatierung, Übersetzungen, PDF-Export
```

## Ausblick: Investorenbereich und Verwaltung

Beides ist bewusst noch nicht umgesetzt, die Architektur ist darauf vorbereitet.

**Geschützter Investorenbereich.** Vertrauliche Inhalte (vollständige Adressen, Exposés, Mietaufstellungen, Wirtschaftlichkeitsberechnungen) dürfen nicht im öffentlichen Frontend oder Repository liegen. Empfohlen: Supabase (Auth mit Einladung per E-Mail, Postgres mit Row Level Security, privater Storage mit signierten Links) und ein Bereich `/[locale]/investoren`, der serverseitig gerendert und in `src/proxy.ts` abgesichert wird. Die öffentliche Seite bleibt statisch und funktioniert unabhängig davon.

**Administrationsbereich.** Zwei Wege: (1) ein Git-basiertes CMS wie Decap oder Keystatic, das die JSON-Dateien über eine Oberfläche bearbeitet – ohne Datenbank und ohne laufende Kosten; (2) Umzug der Objektdaten nach Supabase mit eigener Verwaltungsoberfläche, sinnvoll ab dem Investorenbereich. In beiden Fällen ist nur `src/lib/properties.ts` anzupassen, weil alle Seiten die Daten ausschließlich darüber beziehen.
