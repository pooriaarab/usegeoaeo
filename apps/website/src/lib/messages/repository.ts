import { createId } from "@paralleldrive/cuid2";
import { and, asc, eq } from "drizzle-orm";
import "server-only";

import { getDB } from "@/db";
import { messageTable, threadTable } from "@/db/schema/domain";
import { AuthError } from "@/lib/api-utils";

export async function listMessages(workspaceId: string, threadId: string) {
  const db = await getDB();
  // ensure thread belongs to workspace
  const thr = await db
    .select()
    .from(threadTable)
    .where(and(eq(threadTable.id, threadId), eq(threadTable.workspaceId, workspaceId)))
    .limit(1);
  if (!thr[0]) throw new AuthError("thread not found", 404);
  return db
    .select()
    .from(messageTable)
    .where(and(eq(messageTable.threadId, threadId), eq(messageTable.workspaceId, workspaceId)))
    .orderBy(asc(messageTable.createdAt));
}

export async function addMessage(
  workspaceId: string,
  threadId: string,
  input: { role: "user" | "assistant" | "system" | "tool"; content: string },
) {
  const db = await getDB();
  const thr = await db
    .select()
    .from(threadTable)
    .where(and(eq(threadTable.id, threadId), eq(threadTable.workspaceId, workspaceId)))
    .limit(1);
  if (!thr[0]) throw new AuthError("thread not found", 404);
  const id = `msg_${createId()}`;
  const [row] = await db
    .insert(messageTable)
    .values({
      id,
      threadId,
      workspaceId,
      agentId: thr[0].agentId,
      role: input.role,
      content: input.content,
      metadataJson: "{}",
    })
    .returning();
  await db
    .update(threadTable)
    .set({
      messageCount: (thr[0].messageCount ?? 0) + 1,
      lastMessageAt: new Date(),
    })
    .where(eq(threadTable.id, threadId));
  return row;
}
