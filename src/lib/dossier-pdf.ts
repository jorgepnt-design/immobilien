import { jsPDF } from "jspdf";
import { intlLocale, type Locale } from "@/config/site";
import type { DossierItem } from "@/components/list-views";
import type { Dictionary } from "./i18n/dictionary";
import { countryName } from "./countries";
import { formatArea, formatPercent, formatPrice, locationLine } from "./format";

interface Options {
  t: Dictionary;
  locale: Locale;
  siteName: string;
  siteUrl: string;
}

type RGB = [number, number, number];
const NAVY: RGB = [12, 24, 38];
const GOLD: RGB = [198, 165, 103];
const GOLD_DARK: RGB = [154, 123, 63];
const INK: RGB = [26, 31, 39];
const MUTED: RGB = [107, 101, 88];
const SAND: RGB = [227, 220, 205];
const IVORY: RGB = [248, 245, 239];

const W = 210;
const H = 297;
const M = 20;
const CONTENT_W = W - 2 * M;
const BOTTOM = H - 22;

/** Die Standardschriften des PDF kennen nur Latin-1/Windows-1252 – übrige Zeichen ersetzen. */
function clean(text: string): string {
  return text
    .replace(/≈\s*/g, "ca. ")
    .replace(/[  ]/g, " ")
    .replace(/[^ -~¡-ÿ€‚„“”‘’–—…•]/g, "");
}

/** Lädt ein Bild und schneidet es auf das Zielformat zu (nur im Browser). */
async function loadCover(src: string, ratio: number): Promise<string | null> {
  if (typeof document === "undefined") return null;
  try {
    const blob = await (await fetch(src)).blob();
    const bitmap = await createImageBitmap(blob);
    const srcRatio = bitmap.width / bitmap.height;
    const sw = srcRatio > ratio ? bitmap.height * ratio : bitmap.width;
    const sh = srcRatio > ratio ? bitmap.height : bitmap.width / ratio;
    const canvas = document.createElement("canvas");
    canvas.width = 1400;
    canvas.height = Math.round(1400 / ratio);
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(bitmap, (bitmap.width - sw) / 2, (bitmap.height - sh) / 2, sw, sh, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.86);
  } catch {
    return null;
  }
}

export async function buildDossierPdf(items: DossierItem[], { t, locale, siteName, siteUrl }: Options): Promise<jsPDF> {
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  const L = t.dossier.pdf;
  const date = new Intl.DateTimeFormat(intlLocale[locale], { dateStyle: "long" }).format(new Date());
  let y = M;

  const text = (
    s: string,
    x: number,
    yy: number,
    o: { size?: number; color?: RGB; font?: "helvetica" | "times"; style?: "normal" | "bold" | "italic"; align?: "left" | "right" | "center"; spacing?: number } = {},
  ) => {
    doc.setFont(o.font ?? "helvetica", o.style ?? "normal");
    doc.setFontSize(o.size ?? 10);
    doc.setTextColor(...(o.color ?? INK));
    doc.text(clean(s), x, yy, { align: o.align ?? "left", charSpace: o.spacing ?? 0 });
  };
  const wrap = (s: string, width: number, size: number, font: "helvetica" | "times" = "helvetica", style: "normal" | "bold" = "normal"): string[] => {
    doc.setFont(font, style);
    doc.setFontSize(size);
    return doc.splitTextToSize(clean(s), width) as string[];
  };
  const rule = (yy: number, color: RGB = SAND, x1 = M, x2 = W - M) => {
    doc.setDrawColor(...color);
    doc.setLineWidth(0.2);
    doc.line(x1, yy, x2, yy);
  };
  const newPage = () => {
    doc.addPage();
    y = M + 8;
  };
  const ensure = (needed: number) => {
    if (y + needed > BOTTOM) newPage();
  };
  const sectionTitle = (title: string) => {
    ensure(16);
    y += 4;
    text(title.toUpperCase(), M, y, { size: 7.5, color: GOLD_DARK, style: "bold", spacing: 0.5 });
    y += 2.5;
    rule(y);
    y += 6;
  };

  /* ----- Deckblatt ----- */
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, W, H, "F");
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.15);
  for (let i = 0; i < 14; i++) {
    doc.ellipse(150 + i * 1.5, 92 - i, 10 + i * 9, 6 + i * 6);
  }
  text(siteName.toUpperCase(), M, 28, { size: 10, color: IVORY, font: "times", spacing: 1.2 });
  text(L.coverEyebrow.toUpperCase(), W - M, 28, { size: 7.5, color: GOLD, style: "bold", align: "right", spacing: 0.6 });
  text(L.coverSub.toUpperCase(), M, 176, { size: 8, color: GOLD, style: "bold", spacing: 0.7 });
  text(L.coverTitle, M, 196, { size: 40, color: IVORY, font: "times" });
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.4);
  doc.line(M, 206, M + 28, 206);
  text(`${items.length} ${L.objects}`, M, 220, { size: 11, color: IVORY });
  text(`${L.created} ${date}`, M, 227, { size: 9, color: [190, 196, 205] });
  wrap(t.footer.disclaimer, CONTENT_W, 7).forEach((line, i) =>
    text(line, M, H - 24 + i * 3.4, { size: 7, color: [150, 158, 170] }),
  );

  /* ----- Objektübersicht ----- */
  newPage();
  text(L.overview, M, y + 4, { size: 24, font: "times", color: NAVY });
  y += 16;
  const cols = [M, M + 12, M + 82, M + 122];
  ["#", t.detail.breadcrumb, t.compare.location, t.compare.price].forEach((h, i) =>
    text(h.toUpperCase(), cols[i], y, { size: 6.5, color: MUTED, style: "bold", spacing: 0.4 }),
  );
  y += 2.5;
  rule(y, NAVY);
  y += 6.5;
  items.forEach((p, i) => {
    const titleLines = wrap(p.title, 66, 10.5, "times");
    const locLines = wrap(`${countryName(p.country, locale)}, ${locationLine(p)}`, 36, 8.5);
    const rowH = Math.max(titleLines.length * 4.6 + 4, locLines.length * 4 + 1);
    ensure(rowH + 6);
    text(String(i + 1).padStart(2, "0"), cols[0], y, { size: 9, color: GOLD_DARK, style: "bold" });
    titleLines.forEach((line, j) => text(line, cols[1], y + j * 4.6, { size: 10.5, font: "times", color: NAVY }));
    text(`${p.id} · ${t.types[p.type]}`, cols[1], y + titleLines.length * 4.6, { size: 7, color: MUTED });
    locLines.forEach((line, j) => text(line, cols[2], y + j * 4, { size: 8.5 }));
    text(formatPrice(p.price, locale, t), cols[3], y, { size: 9.5, style: "bold", color: NAVY });
    if (p.mainArea) {
      text(`${t.card[p.mainArea.kind]}: ${formatArea(p.mainArea, locale, t)}`, cols[3], y + 4.5, { size: 7.5, color: MUTED });
    } else if (p.plotArea) {
      text(`${t.card.plot}: ${formatArea(p.plotArea, locale, t)}`, cols[3], y + 4.5, { size: 7.5, color: MUTED });
    }
    y += rowH + 2.5;
    rule(y - 4);
    y += 2.5;
  });

  /* ----- Objektseiten ----- */
  for (const [i, p] of items.entries()) {
    newPage();
    text(`${String(i + 1).padStart(2, "0")}  ·  ${p.id}  ·  ${t.types[p.type]}`.toUpperCase(), M, y, {
      size: 7.5,
      color: GOLD_DARK,
      style: "bold",
      spacing: 0.5,
    });
    text(t.status[p.status].toUpperCase(), W - M, y, { size: 7.5, color: MUTED, style: "bold", align: "right", spacing: 0.5 });
    y += 11;
    const title = wrap(p.title, CONTENT_W, 24, "times");
    title.forEach((line) => {
      text(line, M, y, { size: 24, font: "times", color: NAVY });
      y += 9.5;
    });
    y -= 2.5;
    wrap(p.subtitle, CONTENT_W, 10.5).forEach((line) => {
      text(line, M, y, { size: 10.5, color: MUTED });
      y += 5;
    });
    text(`${countryName(p.country, locale)} · ${p.region} · ${locationLine(p)}`, M, y + 1, { size: 9, color: INK });
    y += 8;

    const cover = p.cover ? await loadCover(p.cover.src, 2) : null;
    if (cover) {
      doc.addImage(cover, "JPEG", M, y, CONTENT_W, CONTENT_W / 2, undefined, "FAST");
      y += CONTENT_W / 2 + 8;
    }

    // Kennzahlenleiste
    const tiles: [string, string][] = [[t.price.label, formatPrice(p.price, locale, t)]];
    if (p.mainArea) tiles.push([t.card[p.mainArea.kind], formatArea(p.mainArea, locale, t)]);
    if (p.plotArea) tiles.push([t.card.plot, formatArea(p.plotArea, locale, t)]);
    tiles.push(
      p.yieldPercent !== undefined
        ? [t.detail.yield, formatPercent(p.yieldPercent, locale)]
        : [t.detail.rentalStatus, t.rental[p.rentalStatus]],
    );
    const tileW = CONTENT_W / tiles.length;
    doc.setFillColor(...IVORY);
    doc.rect(M, y, CONTENT_W, 19, "F");
    tiles.forEach(([label, value], k) => {
      text(label.toUpperCase(), M + 4 + k * tileW, y + 6.5, { size: 6.5, color: MUTED, style: "bold", spacing: 0.3 });
      const v = wrap(value, tileW - 6, 11, "times")[0];
      text(v, M + 4 + k * tileW, y + 13.5, { size: 11, font: "times", color: NAVY });
    });
    y += 25;

    wrap(p.intro, CONTENT_W, 9.5).forEach((line) => {
      ensure(5);
      text(line, M, y, { size: 9.5 });
      y += 4.8;
    });
    y += 2;

    sectionTitle(L.keyData);
    p.keyFacts.forEach((f) => {
      const value = wrap(f.note ? `${f.value} (${f.note})` : f.value, CONTENT_W - 62, 9);
      const label = wrap(f.label, 56, 9);
      const rowH = Math.max(value.length, label.length) * 4.4;
      ensure(rowH + 3);
      label.forEach((line, j) => text(line, M, y + j * 4.4, { size: 9, color: MUTED }));
      value.forEach((line, j) => text(line, M + 62, y + j * 4.4, { size: 9, color: NAVY }));
      y += rowH + 1.2;
      rule(y - 2.4);
      y += 2;
    });

    sectionTitle(L.highlights);
    p.highlights.forEach((h) => {
      const lines = wrap(h, CONTENT_W - 6, 9);
      ensure(lines.length * 4.4 + 2);
      doc.setFillColor(...GOLD);
      doc.circle(M + 1.2, y - 1.1, 0.8, "F");
      lines.forEach((line, j) => text(line, M + 6, y + j * 4.4, { size: 9 }));
      y += lines.length * 4.4 + 1.6;
    });

    sectionTitle(L.notes);
    p.dataNotes.forEach((n) => {
      const lines = wrap(n, CONTENT_W - 6, 8.5);
      ensure(lines.length * 4.1 + 2);
      text("–", M, y, { size: 8.5, color: MUTED });
      lines.forEach((line, j) => text(line, M + 6, y + j * 4.1, { size: 8.5, color: MUTED }));
      y += lines.length * 4.1 + 1.4;
    });
    ensure(8);
    y += 3;
    text(`${siteUrl}/${locale}/immobilien/${p.slug}`, M, y, { size: 7.5, color: GOLD_DARK });
  }

  /* ----- Fußzeilen (ohne Deckblatt) ----- */
  const pages = doc.getNumberOfPages();
  for (let n = 2; n <= pages; n++) {
    doc.setPage(n);
    rule(H - 14);
    text(`${siteName} · ${L.coverTitle} · ${date}`, M, H - 9, { size: 7, color: MUTED });
    text(`${L.page} ${n - 1} / ${pages - 1}`, W - M, H - 9, { size: 7, color: MUTED, align: "right" });
  }
  return doc;
}
