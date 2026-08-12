import { and, desc, eq } from "drizzle-orm";
import "server-only";
import { createId } from "@paralleldrive/cuid2";
import { getDB } from "@/db";
import { agentMemoryTable } from "@/db/schema/domain";
import { AuthError } from "@/lib/api-utils";

export async function listByWorkspace(workspaceId: string, limit = 100) {
  const db = await getDB();
  return db
    .select()
    .from(agentMemoryTable)
    .where(eq(agentMemoryTable.workspaceId, workspaceId))
    .orderBy(desc(agentMemoryTable.createdAt))
    .limit(limit);
}

export async function getById(workspaceId: string, id: string) {
  const db = await getDB();
  const rows = await db
    .select()
    .from(agentMemoryTable)
    .where(and(eq(agentMemoryTable.workspaceId, workspaceId), eq(agentMemoryTable.id, id)))
    .limit(1);
  const row = rows[0];
  if (!row) throw new AuthError("not found", 404);
  return row;
}

export type CreateInput = {
  agentId: unknown;
  key: unknown;
  value: unknown;
};

export async function create(workspaceId: string, input: any, sessionUserId?: string) {
  const db = await getDB();
  const id = `mem_${createId()}`;
  const values: Record<string, unknown> = { id, workspaceId };
  values['agentId'] = input['agentId'];
  values['key'] = input['key'];
  values['valueJson'] = JSON.stringify(input['value'] ?? (Array.isArray(input['value']) ? [] : {}));
  const [row] = await db.insert(agentMemoryTable).values(values as any).returning();
  return row;
}

export async function remove(workspaceId: string, id: string) {
  await getById(workspaceId, id);
  const db = await getDB();
  await db.delete(agentMemoryTable).where(and(eq(agentMemoryTable.workspaceId, workspaceId), eq(agentMemoryTable.id, id)));
}
