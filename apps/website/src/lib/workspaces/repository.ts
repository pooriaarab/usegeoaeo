import { createId } from "@paralleldrive/cuid2";
import { and, eq } from "drizzle-orm";
import "server-only";

import { getDB } from "@/db";
import { workspaceMemberTable, workspaceTable } from "@/db/schema/organization";
import { AuthError } from "@/lib/api-utils";

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48) || "workspace"
  );
}

export async function createWorkspaceForUser(input: {
  userId: string;
  name: string;
}) {
  const db = await getDB();
  const id = `ws_${createId()}`;
  const base = slugify(input.name);
  const slug = `${base}-${createId().slice(0, 6)}`;

  await db.insert(workspaceTable).values({
    id,
    name: input.name,
    slug,
    ownerId: input.userId,
    onboardingStepsJson: "{}",
  });

  await db.insert(workspaceMemberTable).values({
    id: `${id}_${input.userId}`,
    workspaceId: id,
    userId: input.userId,
    role: "owner",
    status: "active",
    joinedAt: new Date(),
  });

  return { id, name: input.name, slug, role: "owner" as const };
}

export async function getWorkspaceIfMember(workspaceId: string, userId: string) {
  const db = await getDB();
  const rows = await db
    .select({
      id: workspaceTable.id,
      name: workspaceTable.name,
      slug: workspaceTable.slug,
      role: workspaceMemberTable.role,
    })
    .from(workspaceMemberTable)
    .innerJoin(workspaceTable, eq(workspaceTable.id, workspaceMemberTable.workspaceId))
    .where(
      and(
        eq(workspaceMemberTable.workspaceId, workspaceId),
        eq(workspaceMemberTable.userId, userId),
        eq(workspaceMemberTable.status, "active"),
      ),
    )
    .limit(1);
  const row = rows[0];
  if (!row) throw new AuthError("workspace not found", 404);
  return row;
}

export async function listMembers(workspaceId: string) {
  const db = await getDB();
  return db
    .select({
      id: workspaceMemberTable.id,
      userId: workspaceMemberTable.userId,
      role: workspaceMemberTable.role,
      status: workspaceMemberTable.status,
      email: workspaceMemberTable.email,
      joinedAt: workspaceMemberTable.joinedAt,
    })
    .from(workspaceMemberTable)
    .where(eq(workspaceMemberTable.workspaceId, workspaceId));
}
