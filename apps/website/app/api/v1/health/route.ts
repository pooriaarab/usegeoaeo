import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "private-repo-7b42",
    time: new Date().toISOString(),
  });
}
