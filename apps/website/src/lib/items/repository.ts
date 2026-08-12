import { and, desc, eq } from "drizzle-orm";
import "server-only";
import { createId } from "@paralleldrive/cuid2";
import { getDB } from "@/db";
import { itemTable } from "@/db/schema/domain";
import { AuthError } from "@/lib/api-utils";

export async function listByWorkspace(workspaceId: string, limit = 100) {
  const db = await getDB();
  return db
    .select()
    .from(itemTable)
    .where(eq(itemTable.workspaceId, workspaceId))
    .orderBy(desc(itemTable.createdAt))
    .limit(limit);
}

export async function getById(workspaceId: string, id: string) {
  const db = await getDB();
  const rows = await db
    .select()
    .from(itemTable)
    .where(and(eq(itemTable.workspaceId, workspaceId), eq(itemTable.id, id)))
    .limit(1);
  const row = rows[0];
  if (!row) throw new AuthError("not found", 404);
  return row;
}

export type CreateInput = {
  type: unknown;
  title: unknown;
  data: unknown;
};

export async function create(workspaceId: string, input: any, sessionUserId?: string) {
  const db = await getDB();
  const id = `itm_${createId()}`;
  const values: Record<string, unknown> = { id, workspaceId };
  values['type'] = input['type'];
  values['title'] = input['title'] ?? '';
  values['dataJson'] = JSON.stringify(input['data'] ?? (Array.isArray(input['data']) ? [] : {}));
  if (sessionUserId) values['createdByUserId'] = sessionUserId;
  const [row] = await db.insert(itemTable).values(values as any).returning();
  return row;
}

export async function remove(workspaceId: string, id: string) {
  await getById(workspaceId, id);
  const db = await getDB();
  await db.delete(itemTable).where(and(eq(itemTable.workspaceId, workspaceId), eq(itemTable.id, id)));
}
