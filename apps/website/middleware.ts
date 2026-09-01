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
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
};
