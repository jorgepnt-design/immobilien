import type { MetadataRoute } from "next";
import { locales, site } from "@/config/site";
import { getAllProperties } from "@/lib/properties";

export default function sitemap(): MetadataRoute.Sitemap {
  const properties = getAllProperties();
  const paths = ["", "/immobilien", "/kontakt", ...properties.map((p) => `/immobilien/${p.slug}`)];
  return locales.flatMap((locale) =>
    paths.map((path) => ({
      url: `${site.url}/${locale}${path}`,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : path.startsWith("/immobilien/") ? 0.8 : 0.6,
    })),
  );
}
