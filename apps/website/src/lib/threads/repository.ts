import { and, desc, eq } from "drizzle-orm";
import "server-only";
import { createId } from "@paralleldrive/cuid2";
import { getDB } from "@/db";
import { threadTable } from "@/db/schema/domain";
import { AuthError } from "@/lib/api-utils";

export async function listByWorkspace(workspaceId: string, limit = 100) {
  const db = await getDB();
  return db
    .select()
    .from(threadTable)
    .where(eq(threadTable.workspaceId, workspaceId))
    .orderBy(desc(threadTable.createdAt))
    .limit(limit);
}

export async function getById(workspaceId: string, id: string) {
  const db = await getDB();
  const rows = await db
    .select()
    .from(threadTable)
    .where(and(eq(threadTable.workspaceId, workspaceId), eq(threadTable.id, id)))
    .limit(1);
  const row = rows[0];
  if (!row) throw new AuthError("not found", 404);
  return row;
}

export type CreateInput = {
  agentId: unknown;
  title: unknown;
};

export async function create(workspaceId: string, input: any, sessionUserId?: string) {
  const db = await getDB();
  const id = `thr_${createId()}`;
  const values: Record<string, unknown> = { id, workspaceId };
  values['agentId'] = input['agentId'];
  values['title'] = input['title'] ?? '';
  values['actor'] = 'member';
  values['actorId'] = sessionUserId ?? 'unknown';
  values['visibility'] = 'internal';
  const [row] = await db.insert(threadTable).values(values as any).returning();
  return row;
}

export async function remove(workspaceId: string, id: string) {
  await getById(workspaceId, id);
  const db = await getDB();
  await db.delete(threadTable).where(and(eq(threadTable.workspaceId, workspaceId), eq(threadTable.id, id)));
}
