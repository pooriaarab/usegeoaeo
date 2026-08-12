import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { getAuth } from "@/server/auth";
import { getDB } from "@/db";
import { noteTable } from "@/db/schema/note";

export const dynamic = "force-dynamic";

/** GET /api/v1/notes — list the signed-in user's notes. */
export async function GET() {
  const session = await (await getAuth()).api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const db = await getDB();
  const notes = await db
    .select()
    .from(noteTable)
    .where(eq(noteTable.userId, session.user.id))
    .orderBy(noteTable.createdAt)
    .limit(50);

  return NextResponse.json({ notes });
}

/** POST /api/v1/notes { title, body } — create a note (proves D1 write). */
export async function POST(request: Request) {
  const session = await (await getAuth()).api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => null)) as
    | { title?: string; body?: string }
    | null;
  if (!body?.title || !body.body) {
    return NextResponse.json({ error: "title and body required" }, { status: 400 });
  }

  const db = await getDB();
  const [created] = await db
    .insert(noteTable)
    .values({ userId: session.user.id, title: body.title, body: body.body })
    .returning();

  return NextResponse.json({ note: created }, { status: 201 });
}

/** DELETE /api/v1/notes?id=... — delete one of the user's notes. */
export async function DELETE(request: Request) {
  const session = await (await getAuth()).api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const db = await getDB();
  await db
    .delete(noteTable)
    .where(and(eq(noteTable.id, id), eq(noteTable.userId, session.user.id)));

  return NextResponse.json({ ok: true });
}
