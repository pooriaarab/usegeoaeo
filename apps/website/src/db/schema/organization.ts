import { createId } from "@paralleldrive/cuid2";
import type { InferSelectModel } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

import { commonColumns } from "./common";
import { userTable } from "./user";

/**
 * Organization = tenant (workspace) mirror of Better Auth's Organization plugin.
 *
 * Per the opus advisory review, Better Auth OWNS the `organization` and
 * `member` tables that its Organization plugin generates. The template mirrors
 * org -> workspace via the plugin's afterCreateOrganization hook (see
 * src/server/auth.ts) so app code can query workspaces without going through
 * Better Auth's APIs.
 *
 * These two tables are the app-side mirror, written only by the hook.
 */
export const workspaceTable = sqliteTable(
  "workspace",
  {
    ...commonColumns,
    id: text("id")
      .primaryKey()
      .$defaultFn(() => `ws_${createId()}`)
      .notNull(),
    name: text("name", { length: 255 }).notNull(),
    slug: text("slug", { length: 255 }).notNull().unique(),
    ownerId: text("owner_id").references(() => userTable.id, { onDelete: "set null" }),
    onboardingCompleteAt: integer("onboarding_complete_at", { mode: "timestamp_ms" }),
    onboardingStepsJson: text("onboarding_steps_json").default("{}").notNull(),
  },
  (table) => [index("workspace_slug_idx").on(table.slug)],
);

export const workspaceMemberTable = sqliteTable(
  "workspace_member",
  {
    ...commonColumns,
    id: text("id")
      .primaryKey()
      .$defaultFn(() => `wsm_${createId()}`)
      .notNull(),
    workspaceId: text("workspace_id")
      .references(() => workspaceTable.id)
      .notNull(),
    userId: text("user_id")
      .references(() => userTable.id)
      .notNull(),
    role: text("role", { length: 50 }).default("member").notNull(),
    status: text("status", { enum: ["active", "pending"] }).default("active").notNull(),
    invitedBy: text("invited_by"),
    email: text("email"),
    joinedAt: integer("joined_at", { mode: "timestamp_ms" }),
  },
  (table) => [
    index("workspace_member_workspace_idx").on(table.workspaceId),
    index("workspace_member_user_idx").on(table.userId),
    uniqueIndex("workspace_member_pair_unique").on(table.workspaceId, table.userId),
  ],
);

export type Workspace = InferSelectModel<typeof workspaceTable>;
export type WorkspaceMember = InferSelectModel<typeof workspaceMemberTable>;
