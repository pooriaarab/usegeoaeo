const DISCOVERY_PATHS = new Set([
  "/agents.md",
  "/auth.md",
  "/design.md",
  "/llms-full.txt",
  "/llms.txt",
  "/manifest.json",
  "/openapi.json",
  "/site.webmanifest",
  "/sitemap.xml",
  "/webmcp.json",
]);

function harden(headers: Headers) {
  headers.delete("Link");
  headers.set("Cache-Control", "private, no-store, max-age=0");
  headers.set("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet, noimageindex");
}

export function protectWorkerPreview(
  pathname: string,
  response: Response,
  workerPreview = process.env.WORKER_PREVIEW,
) {
  if (workerPreview !== "true" && workerPreview !== "1") return response;
  const normalized = pathname.toLowerCase();
  if (normalized === "/robots.txt") {
    const robots = new Response("User-agent: *\nDisallow: /\n", {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
    harden(robots.headers);
    return robots;
  }
  if (DISCOVERY_PATHS.has(normalized) || normalized.startsWith("/.well-known/")) {
    const missing = new Response("Not Found", { status: 404 });
    harden(missing.headers);
    return missing;
  }
  harden(response.headers);
  return response;
}
