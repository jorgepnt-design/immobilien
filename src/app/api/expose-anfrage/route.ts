import { NextResponse } from "next/server";
import { contact, site } from "@/config/site";

/**
 * Nimmt Exposé-Anfragen entgegen und stellt sie dem Vermittler per E-Mail zu (Resend-API).
 * Der Anfragende erhält eine Eingangsbestätigung – beide E-Mails dokumentieren Zeitpunkt,
 * Objekt-ID und die abgegebenen Bestätigungen (Nachweis der Interessentenanfrage).
 *
 * Benötigte Umgebungsvariablen: RESEND_API_KEY, INQUIRY_TO_EMAIL, INQUIRY_FROM_EMAIL.
 * Ohne Konfiguration antwortet die Schnittstelle mit 503; das Formular öffnet dann
 * ersatzweise eine vorbereitete E-Mail im Programm des Besuchers.
 *
 * Vertrauliche Objektdaten (Adresse, Eigentümer, Unterlagen) liegen weder hier noch
 * an anderer Stelle der Website vor – die Freigabe erfolgt manuell durch den Vermittler.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ID_RE = /^[A-Z]{2,4}-\d{4}-\d{3,}$/;

// Einfache Begrenzung pro IP. Auf Serverless-Plattformen gilt sie je Instanz und ist nur ein Grundschutz.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((ts) => now - ts < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return false;
}

const str = (v: unknown, max: number): string => (typeof v === "string" ? v.trim().slice(0, max) : "");
const oneLine = (v: string): string => v.replace(/[\r\n\t]+/g, " ");

async function send(apiKey: string, payload: Record<string, unknown>): Promise<boolean> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) console.error("[expose-anfrage] Versand fehlgeschlagen:", res.status, await res.text());
  return res.ok;
}

export async function POST(request: Request) {
  // Nur Anfragen von der eigenen Website zulassen
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (origin && host && new URL(origin).host !== host) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "validation" }, { status: 400 });
  }

  // Honeypot: Bots erhalten eine scheinbar erfolgreiche Antwort, es wird nichts versendet
  if (str(body.website, 200) !== "") return NextResponse.json({ ok: true });

  const data = {
    firstName: oneLine(str(body.firstName, 100)),
    lastName: oneLine(str(body.lastName, 100)),
    company: oneLine(str(body.company, 200)),
    email: oneLine(str(body.email, 200)),
    phone: oneLine(str(body.phone, 60)),
    subject: oneLine(str(body.subject, 200)),
    message: str(body.message, 5000),
    propertyId: str(body.propertyId, 40),
    locale: str(body.locale, 5),
  };

  const valid =
    data.firstName &&
    data.lastName &&
    EMAIL_RE.test(data.email) &&
    data.phone.replace(/\D/g, "").length >= 6 &&
    data.subject &&
    data.message &&
    body.consent === true &&
    body.broker === true &&
    (data.propertyId === "" || ID_RE.test(data.propertyId));
  if (!valid) return NextResponse.json({ error: "validation" }, { status: 400 });

  const ip = (request.headers.get("x-forwarded-for") ?? "unbekannt").split(",")[0].trim();
  if (rateLimited(ip)) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const { RESEND_API_KEY, INQUIRY_TO_EMAIL, INQUIRY_FROM_EMAIL } = process.env;
  if (!RESEND_API_KEY || !INQUIRY_TO_EMAIL || !INQUIRY_FROM_EMAIL) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const receivedAt = new Date().toISOString();
  const summary = [
    `Objekt-ID:   ${data.propertyId || "– (allgemeine Anfrage)"}`,
    `Eingang:     ${receivedAt}`,
    `Vorname:     ${data.firstName}`,
    `Nachname:    ${data.lastName}`,
    `Unternehmen: ${data.company || "–"}`,
    `E-Mail:      ${data.email}`,
    `Telefon:     ${data.phone}`,
    `Sprache:     ${data.locale || "–"}`,
    "",
    "Bestätigt durch den Anfragenden:",
    "- Kenntnis der Vermittlertätigkeit und der Freigabe von Objektdetails erst nach Prüfung: ja",
    "- Datenschutzhinweise gelesen, Einwilligung in die Verarbeitung: ja",
    "",
    "Nachricht:",
    data.message,
  ].join("\n");

  try {
    const delivered = await send(RESEND_API_KEY, {
      from: INQUIRY_FROM_EMAIL,
      to: INQUIRY_TO_EMAIL.split(",").map((s) => s.trim()),
      reply_to: data.email,
      subject: data.subject,
      text: summary,
    });
    if (!delivered) return NextResponse.json({ error: "delivery_failed" }, { status: 502 });

    // Eingangsbestätigung an den Anfragenden (Fehler hier gefährden die Anfrage nicht)
    await send(RESEND_API_KEY, {
      from: INQUIRY_FROM_EMAIL,
      to: [data.email],
      reply_to: contact.email,
      subject: `Eingangsbestätigung: ${data.subject}`,
      text: [
        `Guten Tag ${data.firstName} ${data.lastName},`,
        "",
        "vielen Dank für Ihre Anfrage. Wir haben sie wie folgt erhalten und melden uns nach Prüfung bei Ihnen.",
        "Objektadresse, Eigentümerangaben und vollständige Unterlagen stellen wir nach Freigabe zur Verfügung;",
        "hierfür können eine Vertraulichkeits- und eine Provisionsvereinbarung in Textform erforderlich sein.",
        "",
        summary,
        "",
        `${contact.company} – ${contact.descriptor}`,
        `${contact.street}, ${contact.city}`,
        contact.email,
        site.url,
      ].join("\n"),
    }).catch((e) => console.error("[expose-anfrage] Bestätigung fehlgeschlagen:", e));
  } catch (e) {
    console.error("[expose-anfrage] Versand fehlgeschlagen:", e);
    return NextResponse.json({ error: "delivery_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
