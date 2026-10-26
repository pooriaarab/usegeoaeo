import type { NextRequest } from "next/server";

import { negotiateMarkdown } from "./src/utils/markdown-negotiation";
import { protectWorkerPreview } from "./src/utils/worker-preview-indexing";

// Next.js App Router emits inline bootstrap scripts, and pages embed JSON-LD
// plus one inline style. There is no nonce pipeline, so script-src and
// style-src allow 'unsafe-inline' to match that loading strategy.
// next dev wraps client modules in eval() (EvalSourceMapDevToolPlugin),
// so development also allows 'unsafe-eval'. Production omits it.
// The site is not embedded, so framing is denied.
function contentSecurityPolicy() {
  const scriptSrc =
    process.env.NODE_ENV === "development"
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
      : "script-src 'self' 'unsafe-inline'";
  return [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-src 'none'",
    "frame-ancestors 'none'",
  ].join("; ");
}

function requestIsHttps(request: NextRequest) {
  if (request.nextUrl.protocol === "https:") return true;
  const forwarded = request.headers.get("x-forwarded-proto");
  return forwarded?.split(",")[0]?.trim().toLowerCase() === "https";
}

function applySecurityHeaders(request: NextRequest, response: Response) {
  response.headers.set("Content-Security-Policy", contentSecurityPolicy());
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  if (requestIsHttps(request)) {
    response.headers.set("Strict-Transport-Security", "max-age=31536000");
  }
  return response;
}

export function middleware(request: NextRequest) {
  const response = negotiateMarkdown(request);
  response.headers.set(
    "Link",
    '</llms.txt>; rel="describedby", </llms-full.txt>; rel="describedby", </ai.txt>; rel="describedby", </.well-known/agent-card.json>; rel="service-meta"',
  );
  return applySecurityHeaders(request, protectWorkerPreview(request.nextUrl.pathname, response));
}

export const config = {
  // _next/static is excluded for perf (hashed, high-volume build assets that
  // are never indexable pages). /_next/image and /favicon.ico still need to
  // run through protectWorkerPreview since they can serve real image content.
  matcher: "/((?!_next/static).*)",
};
