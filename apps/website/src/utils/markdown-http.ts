import siteConfig from "../../geoaeo.config";
import { protectWorkerPreview } from "./worker-preview-indexing";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
};

export function markdownResponse(body: string, path: string, status = 200) {
  const headers = {
    "Content-Type": "text/markdown; charset=utf-8",
    // Token count is an estimate: characters divided by four.
    "X-Markdown-Tokens": String(Math.ceil(body.length / 4)),
    "X-Robots-Tag": "noindex, follow",
    "Content-Location": new URL(path, siteConfig.siteUrl).href,
    "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    ...CORS,
  };
  return protectWorkerPreview(path, new Response(body, { status, headers }));
}

export function markdownNotFound() {
  const response = markdownResponse("# Not Found\n", "/api/markdown", 404);
  response.headers.delete("Content-Location");
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export function markdownOptions() {
  return new Response(null, { status: 204, headers: CORS });
}
