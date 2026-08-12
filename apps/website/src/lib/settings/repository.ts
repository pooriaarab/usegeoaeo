import { and, desc, eq } from "drizzle-orm";
import "server-only";
import { createId } from "@paralleldrive/cuid2";
import { getDB } from "@/db";
import { settingTable } from "@/db/schema/domain";
import { AuthError } from "@/lib/api-utils";

export async function listByWorkspace(workspaceId: string, limit = 100) {
  const db = await getDB();
  return db
    .select()
    .from(settingTable)
    .where(eq(settingTable.workspaceId, workspaceId))
    .orderBy(desc(settingTable.createdAt))
    .limit(limit);
}

export async function getById(workspaceId: string, id: string) {
  const db = await getDB();
  const rows = await db
    .select()
    .from(settingTable)
    .where(and(eq(settingTable.workspaceId, workspaceId), eq(settingTable.id, id)))
    .limit(1);
  const row = rows[0];
  if (!row) throw new AuthError("not found", 404);
  return row;
}

export type CreateInput = {
  key: unknown;
  value: unknown;
};

export async function create(workspaceId: string, input: any, sessionUserId?: string) {
  const db = await getDB();
  const id = `set_${createId()}`;
  const values: Record<string, unknown> = { id, workspaceId };
  values['key'] = input['key'];
  values['valueJson'] = JSON.stringify(input['value'] ?? (Array.isArray(input['value']) ? [] : {}));
  const [row] = await db.insert(settingTable).values(values as any).returning();
  return row;
}

export async function remove(workspaceId: string, id: string) {
  await getById(workspaceId, id);
  const db = await getDB();
  await db.delete(settingTable).where(and(eq(settingTable.workspaceId, workspaceId), eq(settingTable.id, id)));
}
