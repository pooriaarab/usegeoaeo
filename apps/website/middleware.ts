import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { protectWorkerPreview } from "./src/utils/worker-preview-indexing";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  if (request.nextUrl.pathname === "/") {
    response.headers.set(
      "Link",
      '</llms.txt>; rel="describedby", </.well-known/agent-card.json>; rel="service-meta"',
    );
  }
  return protectWorkerPreview(request.nextUrl.pathname, response);
}

export const config = {
  // _next/static is excluded for perf (hashed, high-volume build assets that
  // are never indexable pages). /_next/image and /favicon.ico still need to
  // run through protectWorkerPreview since they can serve real image content.
  matcher: "/((?!_next/static).*)",
};
