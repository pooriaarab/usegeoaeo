import { getAuth } from "@/server/auth";
import { type NextRequest } from "next/server";

// Never collect Better Auth handlers as static route data during Next build.
export const dynamic = "force-dynamic";

/**
 * Better Auth catch-all handler. All Better Auth routes (sign-in, sign-up,
 * session, callback, etc.) are served here.
 */
export async function GET(request: NextRequest) {
  return (await getAuth()).handler(request);
}
export async function POST(request: NextRequest) {
  return (await getAuth()).handler(request);
}
