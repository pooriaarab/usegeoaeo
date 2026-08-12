import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getAuth } from "@/server/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { CloudflareEnv } from "@/types/cloudflare-env";
import { getFlag, setFlag } from "@template/config";

export const dynamic = "force-dynamic";

/** GET /api/v1/flags - List all feature flags from FLAGS KV */
export async function GET() {
  const session = await (await getAuth()).api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { env } = await getCloudflareContext({ async: true });
  const cfEnv = env as CloudflareEnv;
  if (!cfEnv.FLAGS) {
    return NextResponse.json({ error: "FLAGS KV namespace not bound" }, { status: 500 });
  }

  try {
    const listResult = await cfEnv.FLAGS.list({ prefix: "flag:" });
    const flags: Array<{ name: string; value: any }> = [];

    for (const key of listResult.keys) {
      const name = key.name.replace(/^flag:/, "");
      // Default to boolean or auto-parsed json
      const val = await getFlag(cfEnv.FLAGS, name, null);
      flags.push({ name, value: val });
    }

    // Include some defaults if list is empty
    if (flags.length === 0) {
      flags.push({ name: "beta-features", value: false });
      flags.push({ name: "maintenance-mode", value: false });
    }

    return NextResponse.json({ flags });
  } catch (err: any) {
    console.error("[flags GET] Error reading from KV:", err);
    return NextResponse.json({ error: `KV read failed: ${err.message || err}` }, { status: 500 });
  }
}

/** POST /api/v1/flags - Set or toggle a feature flag in FLAGS KV.
 * Authz: not every signed-in user. Allowed when:
 * - ENVIRONMENT is not production (local/demo), OR
 * - user email is listed in FLAGS_ADMIN_EMAILS (comma-separated secret/var).
 * Real apps should replace this with role-based org admin checks.
 */
export async function POST(request: Request) {
  const session = await (await getAuth()).api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { env } = await getCloudflareContext({ async: true });
  const cfEnv = env as CloudflareEnv;

  const isDev = (cfEnv.ENVIRONMENT || process.env.ENVIRONMENT || "development") !== "production";
  const adminEmails = (process.env.FLAGS_ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const email = (session.user.email || "").toLowerCase();
  const isAdmin = adminEmails.length > 0 && adminEmails.includes(email);

  if (!isDev && !isAdmin) {
    return NextResponse.json(
      { error: "forbidden: flag writes require FLAGS_ADMIN_EMAILS in production" },
      { status: 403 },
    );
  }

  const body = (await request.json().catch(() => null)) as {
    name?: string;
    value?: unknown;
  } | null;

  if (!body?.name || body.value === undefined) {
    return NextResponse.json({ error: "name and value are required" }, { status: 400 });
  }

  // Guard flag key shape: alnum/dash/underscore only, modest length
  if (!/^[a-zA-Z0-9._-]{1,64}$/.test(body.name)) {
    return NextResponse.json({ error: "invalid flag name" }, { status: 400 });
  }

  if (!cfEnv.FLAGS) {
    return NextResponse.json({ error: "FLAGS KV namespace not bound" }, { status: 500 });
  }

  try {
    await setFlag(cfEnv.FLAGS, body.name, body.value);
    return NextResponse.json({ ok: true, name: body.name, value: body.value });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[flags POST] Error writing to KV:", err);
    return NextResponse.json({ error: `KV write failed: ${message}` }, { status: 500 });
  }
}
