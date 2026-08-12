import { and, desc, eq } from "drizzle-orm";
import "server-only";
import { createId } from "@paralleldrive/cuid2";
import { getDB } from "@/db";
import { toolTable } from "@/db/schema/domain";
import { AuthError } from "@/lib/api-utils";

export async function listByWorkspace(workspaceId: string, limit = 100) {
  const db = await getDB();
  return db
    .select()
    .from(toolTable)
    .where(eq(toolTable.workspaceId, workspaceId))
    .orderBy(desc(toolTable.createdAt))
    .limit(limit);
}

export async function getById(workspaceId: string, id: string) {
  const db = await getDB();
  const rows = await db
    .select()
    .from(toolTable)
    .where(and(eq(toolTable.workspaceId, workspaceId), eq(toolTable.id, id)))
    .limit(1);
  const row = rows[0];
  if (!row) throw new AuthError("not found", 404);
  return row;
}

export type CreateInput = {
  name: unknown;
  description: unknown;
  kind: unknown;
};

export async function create(workspaceId: string, input: any, sessionUserId?: string) {
  const db = await getDB();
  const id = `tool_${createId()}`;
  const values: Record<string, unknown> = { id, workspaceId };
  values['name'] = input['name'];
  values['description'] = input['description'] ?? '';
  values['kind'] = input['kind'];
  values['inputSchemaJson'] = JSON.stringify({});
  const [row] = await db.insert(toolTable).values(values as any).returning();
  return row;
}

export async function remove(workspaceId: string, id: string) {
  await getById(workspaceId, id);
  const db = await getDB();
  await db.delete(toolTable).where(and(eq(toolTable.workspaceId, workspaceId), eq(toolTable.id, id)));
}
