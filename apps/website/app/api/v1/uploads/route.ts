import { createId } from "@paralleldrive/cuid2";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getAuth } from "@/server/auth";
import { getDB } from "@/db";
import { uploadTable } from "@/db/schema/upload";
import { buildUploadKey, ALLOWED_CONTENT_TYPES, MAX_UPLOAD_SIZE_BYTES } from "@template/storage";

export const dynamic = "force-dynamic";

/** GET /api/v1/uploads - list the signed-in user's uploads */
export async function GET() {
  const session = await (await getAuth()).api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const db = await getDB();
  const uploads = await db
    .select()
    .from(uploadTable)
    .where(eq(uploadTable.userId, session.user.id))
    .orderBy(uploadTable.createdAt);

  return NextResponse.json({ uploads });
}

/** POST /api/v1/uploads - creates a pending upload row */
export async function POST(request: Request) {
  const session = await (await getAuth()).api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => null)) as {
    filename?: string;
    contentType?: string;
    sizeBytes?: number;
  } | null;

  if (!body?.filename || !body.contentType || body.sizeBytes === undefined) {
    return NextResponse.json(
      { error: "filename, contentType, and sizeBytes are required" },
      { status: 400 }
    );
  }

  const { filename, contentType, sizeBytes } = body;

  if (sizeBytes > MAX_UPLOAD_SIZE_BYTES) {
    return NextResponse.json(
      { error: `File size exceeds the maximum limit of ${MAX_UPLOAD_SIZE_BYTES / (1024 * 1024)}MB` },
      { status: 400 }
    );
  }

  if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
    return NextResponse.json(
      { error: `Content-type "${contentType}" is not supported.` },
      { status: 400 }
    );
  }

  const db = await getDB();

  // Pre-generate the same id used in the R2 object key so paths stay consistent.
  const uploadId = `upl_${createId()}`;
  const key = buildUploadKey(session.user.id, uploadId, filename);

  const [uploadRow] = await db
    .insert(uploadTable)
    .values({
      id: uploadId,
      userId: session.user.id,
      key,
      filename,
      contentType,
      sizeBytes,
      status: "pending",
    })
    .returning();

  // Return the newly created upload row plus the PUT URL for streaming content
  const putUrl = `/api/v1/uploads/${uploadRow.id}/content`;

  return NextResponse.json({
    uploadId: uploadRow.id,
    key: uploadRow.key,
    putUrl,
    upload: uploadRow,
  });
}
