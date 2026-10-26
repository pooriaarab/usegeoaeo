import siteConfig from "../../geoaeo.config";
import { protectWorkerPreview } from "./worker-preview-indexing";

export function markdownResponse(body: string, path: string, status = 200) {
  return protectWorkerPreview(path, new Response(body, {
    status,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "X-Markdown-Tokens": String(Math.ceil(body.length / 4)),
      "X-Robots-Tag": "noindex, follow",
      "Content-Location": new URL(path, siteConfig.siteUrl).href,
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
    },
  }));
}

export function markdownOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
    },
  });
}
