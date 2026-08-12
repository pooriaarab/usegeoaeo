import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getAuth } from "@/server/auth";
import { getDB } from "@/db";
import { uploadTable } from "@/db/schema/upload";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { CloudflareEnv } from "@/types/cloudflare-env";
import { headObject } from "@template/storage";

export const dynamic = "force-dynamic";

/** POST /api/v1/uploads/[id]/complete - verify with R2 head and mark ready */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await (await getAuth()).api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const db = await getDB();
  const [uploadRow] = await db
    .select()
    .from(uploadTable)
    .where(eq(uploadTable.id, id))
    .limit(1);

  if (!uploadRow) {
    return NextResponse.json({ error: "upload not found" }, { status: 404 });
  }

  if (uploadRow.userId !== session.user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { env } = await getCloudflareContext({ async: true });
  const cfEnv = env as CloudflareEnv;
  if (!cfEnv.UPLOADS) {
    return NextResponse.json({ error: "R2 bucket 'UPLOADS' not found" }, { status: 500 });
  }

  try {
    const meta = await headObject(cfEnv.UPLOADS, uploadRow.key);
    if (!meta) {
      return NextResponse.json(
        { error: "Object not found in R2. Stream the content before completing." },
        { status: 400 }
      );
    }

    const [updatedRow] = await db
      .update(uploadTable)
      .set({
        status: "ready",
        sizeBytes: meta.size,
        completedAt: new Date(),
      })
      .where(eq(uploadTable.id, id))
      .returning();

    return NextResponse.json({ ok: true, upload: updatedRow });
  } catch (err: any) {
    console.error(`[upload complete] Error verifying file:`, err);
    return NextResponse.json({ error: `R2 verification failed: ${err.message || err}` }, { status: 500 });
  }
}
