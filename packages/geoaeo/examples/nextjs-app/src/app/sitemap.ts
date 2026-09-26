import type { MetadataRoute } from "next";
import { sitemapUrls } from "geoaeo";
import { siteConfig } from "../geoaeo.config";

export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapUrls(siteConfig).map((url, index) => ({
    url,
    changeFrequency: "monthly" as const,
    priority: index === 0 ? 1 : 0.8,
  }));
}
