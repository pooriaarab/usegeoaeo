import { NextResponse } from "next/server";

export function middleware() {
  const response = NextResponse.next();
  response.headers.set(
    "Link",
    '</llms.txt>; rel="describedby", </.well-known/agent-card.json>; rel="service-meta"',
  );
  return response;
}

export const config = {
  matcher: "/",
};
