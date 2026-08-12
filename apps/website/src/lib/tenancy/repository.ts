import { and, eq } from "drizzle-orm";
import "server-only";

import { getDB } from "@/db";
import { workspaceMemberTable, workspaceTable } from "@/db/schema/organization";
import { AuthError } from "@/lib/api-utils";

export type TenantContext = {
  workspaceId: string;
  role: string;
  workspace: {
    id: string;
    name: string;
    slug: string;
  };
};

/** Resolve a workspace membership for the authenticated user. */
export async function resolveTenantForUser(
  userId: string,
  preferredWorkspaceId?: string | null,
): Promise<TenantContext> {
  const db = await getDB();

  if (preferredWorkspaceId) {
    const rows = await db
      .select({
        workspaceId: workspaceMemberTable.workspaceId,
        role: workspaceMemberTable.role,
        id: workspaceTable.id,
        name: workspaceTable.name,
        slug: workspaceTable.slug,
      })
      .from(workspaceMemberTable)
      .innerJoin(workspaceTable, eq(workspaceTable.id, workspaceMemberTable.workspaceId))
      .where(
        and(
          eq(workspaceMemberTable.userId, userId),
          eq(workspaceMemberTable.workspaceId, preferredWorkspaceId),
          eq(workspaceMemberTable.status, "active"),
        ),
      )
      .limit(1);
    const row = rows[0];
    if (row) {
      return {
        workspaceId: row.workspaceId,
        role: row.role,
        workspace: { id: row.id, name: row.name, slug: row.slug },
      };
    }
  }

  const rows = await db
    .select({
      workspaceId: workspaceMemberTable.workspaceId,
      role: workspaceMemberTable.role,
      id: workspaceTable.id,
      name: workspaceTable.name,
      slug: workspaceTable.slug,
    })
    .from(workspaceMemberTable)
    .innerJoin(workspaceTable, eq(workspaceTable.id, workspaceMemberTable.workspaceId))
    .where(
      and(eq(workspaceMemberTable.userId, userId), eq(workspaceMemberTable.status, "active")),
    )
    .limit(5);

  if (rows.length === 0) {
    throw new AuthError("onboarding required: no workspace membership", 403);
  }

  const row = rows[0]!;
  return {
    workspaceId: row.workspaceId,
    role: row.role,
    workspace: { id: row.id, name: row.name, slug: row.slug },
  };
}

export async function listWorkspacesForUser(userId: string) {
  const db = await getDB();
  return db
    .select({
      id: workspaceTable.id,
      name: workspaceTable.name,
      slug: workspaceTable.slug,
      role: workspaceMemberTable.role,
      status: workspaceMemberTable.status,
    })
    .from(workspaceMemberTable)
    .innerJoin(workspaceTable, eq(workspaceTable.id, workspaceMemberTable.workspaceId))
    .where(eq(workspaceMemberTable.userId, userId));
}
