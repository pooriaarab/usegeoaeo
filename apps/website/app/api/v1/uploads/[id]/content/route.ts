import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getAuth } from "@/server/auth";
import { getDB } from "@/db";
import { uploadTable } from "@/db/schema/upload";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { CloudflareEnv } from "@/types/cloudflare-env";
import { putObject, getObject } from "@template/storage";

export const dynamic = "force-dynamic";

/** PUT /api/v1/uploads/[id]/content - stream request body to R2 */
export async function PUT(
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

  // R2 put requires a known-length body (request.body stream often has no
  // content-length after framework plumbing). Buffer first for template size.
  const body = await request.arrayBuffer();
  if (body.byteLength === 0) {
    return NextResponse.json({ error: "empty request body" }, { status: 400 });
  }
  if (uploadRow.sizeBytes != null && body.byteLength > uploadRow.sizeBytes) {
    return NextResponse.json(
      { error: `body exceeds declared sizeBytes (${uploadRow.sizeBytes})` },
      { status: 400 },
    );
  }

  const { env } = await getCloudflareContext({ async: true });
  const cfEnv = env as CloudflareEnv;
  if (!cfEnv.UPLOADS) {
    return NextResponse.json({ error: "R2 bucket 'UPLOADS' not found" }, { status: 500 });
  }

  try {
    await putObject(cfEnv.UPLOADS, uploadRow.key, body, {
      httpMetadata: {
        contentType: uploadRow.contentType,
      },
    });

    return NextResponse.json({ ok: true, bytes: body.byteLength });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[upload PUT] Failed to stream to R2:`, err);
    return NextResponse.json({ error: `R2 storage put failed: ${message}` }, { status: 500 });
  }
}

/** GET /api/v1/uploads/[id]/content - stream from R2 if owner */
export async function GET(
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

  const obj = await getObject(cfEnv.UPLOADS, uploadRow.key);
  if (!obj) {
    return NextResponse.json({ error: "file content not found in storage" }, { status: 404 });
  }

  const responseHeaders = new Headers();
  responseHeaders.set("Content-Type", uploadRow.contentType);
  responseHeaders.set("Content-Length", obj.size.toString());
  responseHeaders.set(
    "Content-Disposition",
    `inline; filename="${encodeURIComponent(uploadRow.filename)}"`
  );

  return new Response(obj.body, {
    headers: responseHeaders,
  });
}
