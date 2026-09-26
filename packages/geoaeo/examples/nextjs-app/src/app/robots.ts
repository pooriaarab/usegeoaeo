import type { MetadataRoute } from "next";
import { siteConfig } from "../geoaeo.config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: new URL("/sitemap.xml", siteConfig.siteUrl).toString(),
  };
}
