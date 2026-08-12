import { and, desc, eq } from "drizzle-orm";
import "server-only";
import { createId } from "@paralleldrive/cuid2";
import { getDB } from "@/db";
import { agentTable } from "@/db/schema/domain";
import { AuthError } from "@/lib/api-utils";

export async function listByWorkspace(workspaceId: string, limit = 100) {
  const db = await getDB();
  return db
    .select()
    .from(agentTable)
    .where(eq(agentTable.workspaceId, workspaceId))
    .orderBy(desc(agentTable.createdAt))
    .limit(limit);
}

export async function getById(workspaceId: string, id: string) {
  const db = await getDB();
  const rows = await db
    .select()
    .from(agentTable)
    .where(and(eq(agentTable.workspaceId, workspaceId), eq(agentTable.id, id)))
    .limit(1);
  const row = rows[0];
  if (!row) throw new AuthError("not found", 404);
  return row;
}

export type CreateInput = {
  name: unknown;
  model: unknown;
  description: unknown;
  systemPrompt: unknown;
};

export async function create(workspaceId: string, input: any, sessionUserId?: string) {
  const db = await getDB();
  const id = `agt_${createId()}`;
  const values: Record<string, unknown> = { id, workspaceId };
  values['name'] = input['name'];
  values['model'] = input['model'];
  values['description'] = input['description'] ?? '';
  values['systemPrompt'] = input['systemPrompt'] ?? '';
  const [row] = await db.insert(agentTable).values(values as any).returning();
  return row;
}

export async function remove(workspaceId: string, id: string) {
  await getById(workspaceId, id);
  const db = await getDB();
  await db.delete(agentTable).where(and(eq(agentTable.workspaceId, workspaceId), eq(agentTable.id, id)));
}
