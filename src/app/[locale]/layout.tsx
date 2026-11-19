import type { Metadata, Viewport } from "next";
import { DM_Sans, Plus_Jakarta_Sans } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import { isLocale, locales, site } from "@/config/site";
import { getDictionary } from "@/lib/i18n/dictionary";
import { I18nProvider } from "@/components/providers";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const dmSans = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin"], display: "swap" });
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: "#f7fcff",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return {
    metadataBase: new URL(site.url),
    title: { default: `${site.name} – ${site.tagline}`, template: `%s | ${site.name}` },
    description: t.hero.sub,
    openGraph: {
      type: "website",
      siteName: site.name,
      locale,
      title: `${site.name} – ${site.tagline}`,
      description: t.hero.sub,
    },
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  return (
    <html lang={locale} className={`${dmSans.variable} ${jakarta.variable}`}>
      <body className="flex min-h-screen flex-col">
        <I18nProvider locale={locale} dict={dict}>
          <a
            href="#inhalt"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-champagne focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-navy-950"
          >
            {dict.common.skipToContent}
          </a>
          <Header />
          <main id="inhalt" className="flex-1">
            {children}
          </main>
          <Footer locale={locale} />
        </I18nProvider>
      </body>
    </html>
  );
}
