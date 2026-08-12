import { and, desc, eq } from "drizzle-orm";
import "server-only";
import { createId } from "@paralleldrive/cuid2";
import { getDB } from "@/db";
import { webhookTable } from "@/db/schema/domain";
import { AuthError } from "@/lib/api-utils";

export async function listByWorkspace(workspaceId: string, limit = 100) {
  const db = await getDB();
  return db
    .select()
    .from(webhookTable)
    .where(eq(webhookTable.workspaceId, workspaceId))
    .orderBy(desc(webhookTable.createdAt))
    .limit(limit);
}

export async function getById(workspaceId: string, id: string) {
  const db = await getDB();
  const rows = await db
    .select()
    .from(webhookTable)
    .where(and(eq(webhookTable.workspaceId, workspaceId), eq(webhookTable.id, id)))
    .limit(1);
  const row = rows[0];
  if (!row) throw new AuthError("not found", 404);
  return row;
}

export type CreateInput = {
  agentId: unknown;
  url: unknown;
  secret: unknown;
  events: unknown;
};

export async function create(workspaceId: string, input: any, sessionUserId?: string) {
  const db = await getDB();
  const id = `wh_${createId()}`;
  const values: Record<string, unknown> = { id, workspaceId };
  values['agentId'] = input['agentId'];
  values['url'] = input['url'];
  values['secretHash'] = String(input.secret);
  values['eventsJson'] = JSON.stringify(input['events'] ?? (Array.isArray(input['events']) ? [] : {}));
  values['eventsJson'] = JSON.stringify(input.events ?? []);
  const [row] = await db.insert(webhookTable).values(values as any).returning();
  return row;
}

export async function remove(workspaceId: string, id: string) {
  await getById(workspaceId, id);
  const db = await getDB();
  await db.delete(webhookTable).where(and(eq(webhookTable.workspaceId, workspaceId), eq(webhookTable.id, id)));
}
