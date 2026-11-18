import { NextResponse } from "next/server";

/**
 * Nimmt Objektanfragen entgegen und stellt sie per E-Mail zu (Resend-API).
 * Benötigte Umgebungsvariablen: RESEND_API_KEY, INQUIRY_TO_EMAIL, INQUIRY_FROM_EMAIL.
 * Ohne Konfiguration wird die Anfrage NICHT angenommen (HTTP 503) – es geht nichts stillschweigend verloren.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ID_RE = /^[A-Z]{2,4}-\d{4}-\d{3,}$/;

// Einfache Begrenzung pro IP. Auf Serverless-Plattformen gilt sie je Instanz und ist daher nur ein Grundschutz.
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
    name: oneLine(str(body.name, 200)),
    company: oneLine(str(body.company, 200)),
    email: oneLine(str(body.email, 200)),
    phone: oneLine(str(body.phone, 60)),
    subject: oneLine(str(body.subject, 200)),
    message: str(body.message, 5000),
    propertyId: str(body.propertyId, 40),
    locale: str(body.locale, 5),
  };

  const valid =
    data.name &&
    data.company &&
    EMAIL_RE.test(data.email) &&
    data.subject &&
    data.message &&
    body.consent === true &&
    (data.propertyId === "" || ID_RE.test(data.propertyId));
  if (!valid) return NextResponse.json({ error: "validation" }, { status: 400 });

  const ip = (request.headers.get("x-forwarded-for") ?? "unbekannt").split(",")[0].trim();
  if (rateLimited(ip)) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const { RESEND_API_KEY, INQUIRY_TO_EMAIL, INQUIRY_FROM_EMAIL } = process.env;
  if (!RESEND_API_KEY || !INQUIRY_TO_EMAIL || !INQUIRY_FROM_EMAIL) {
    console.warn("[anfrage] E-Mail-Versand ist nicht konfiguriert – Anfrage wurde abgewiesen.");
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const text = [
    `Objekt-ID:   ${data.propertyId || "– (allgemeine Anfrage)"}`,
    `Name:        ${data.name}`,
    `Unternehmen: ${data.company}`,
    `E-Mail:      ${data.email}`,
    `Telefon:     ${data.phone || "–"}`,
    `Sprache:     ${data.locale || "–"}`,
    `Einwilligung Datenschutz: ja (${new Date().toISOString()})`,
    "",
    "Nachricht:",
    data.message,
  ].join("\n");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: INQUIRY_FROM_EMAIL,
        to: INQUIRY_TO_EMAIL.split(",").map((s) => s.trim()),
        reply_to: data.email,
        subject: data.subject,
        text,
      }),
    });
    if (!res.ok) {
      console.error("[anfrage] Versand fehlgeschlagen:", res.status, await res.text());
      return NextResponse.json({ error: "delivery_failed" }, { status: 502 });
    }
  } catch (e) {
    console.error("[anfrage] Versand fehlgeschlagen:", e);
    return NextResponse.json({ error: "delivery_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
