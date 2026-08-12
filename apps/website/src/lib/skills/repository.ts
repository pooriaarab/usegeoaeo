import { and, desc, eq } from "drizzle-orm";
import "server-only";
import { createId } from "@paralleldrive/cuid2";
import { getDB } from "@/db";
import { skillTable } from "@/db/schema/domain";
import { AuthError } from "@/lib/api-utils";

export async function listByWorkspace(workspaceId: string, limit = 100) {
  const db = await getDB();
  return db
    .select()
    .from(skillTable)
    .where(eq(skillTable.workspaceId, workspaceId))
    .orderBy(desc(skillTable.createdAt))
    .limit(limit);
}

export async function getById(workspaceId: string, id: string) {
  const db = await getDB();
  const rows = await db
    .select()
    .from(skillTable)
    .where(and(eq(skillTable.workspaceId, workspaceId), eq(skillTable.id, id)))
    .limit(1);
  const row = rows[0];
  if (!row) throw new AuthError("not found", 404);
  return row;
}

export type CreateInput = {
  agentId: unknown;
  name: unknown;
  body: unknown;
  description: unknown;
};

export async function create(workspaceId: string, input: any, sessionUserId?: string) {
  const db = await getDB();
  const id = `skl_${createId()}`;
  const values: Record<string, unknown> = { id, workspaceId };
  values['agentId'] = input['agentId'];
  values['name'] = input['name'];
  values['body'] = input['body'];
  values['description'] = input['description'] ?? '';
  const [row] = await db.insert(skillTable).values(values as any).returning();
  return row;
}

export async function remove(workspaceId: string, id: string) {
  await getById(workspaceId, id);
  const db = await getDB();
  await db.delete(skillTable).where(and(eq(skillTable.workspaceId, workspaceId), eq(skillTable.id, id)));
}
