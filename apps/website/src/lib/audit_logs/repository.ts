import { and, desc, eq } from "drizzle-orm";
import "server-only";
import { createId } from "@paralleldrive/cuid2";
import { getDB } from "@/db";
import { auditLogTable } from "@/db/schema/domain";
import { AuthError } from "@/lib/api-utils";

export async function listByWorkspace(workspaceId: string, limit = 100) {
  const db = await getDB();
  return db
    .select()
    .from(auditLogTable)
    .where(eq(auditLogTable.workspaceId, workspaceId))
    .orderBy(desc(auditLogTable.createdAt))
    .limit(limit);
}

export async function getById(workspaceId: string, id: string) {
  const db = await getDB();
  const rows = await db
    .select()
    .from(auditLogTable)
    .where(and(eq(auditLogTable.workspaceId, workspaceId), eq(auditLogTable.id, id)))
    .limit(1);
  const row = rows[0];
  if (!row) throw new AuthError("not found", 404);
  return row;
}
