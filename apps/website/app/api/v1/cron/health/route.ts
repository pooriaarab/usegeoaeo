import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDB } from "@/db";
import { outboxTable } from "@/db/schema/domain";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const secret = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const db = await getDB();
  // mark a small batch of pending outbox rows as attempted (demo drain)
  const pending = await db.select().from(outboxTable).where(eq(outboxTable.status, "pending")).limit(10);
  for (const row of pending) {
    await db
      .update(outboxTable)
      .set({ status: "sent", sentAt: new Date(), attempts: (row.attempts ?? 0) + 1 })
      .where(eq(outboxTable.id, row.id));
  }
  return NextResponse.json({
    ok: true,
    drained: pending.length,
    cron: request.headers.get("x-cron-pattern"),
  });
}

export async function GET() {
  return NextResponse.json({ ok: true, service: "cron-health" });
}
