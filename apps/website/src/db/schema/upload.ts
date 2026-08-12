import { createId } from "@paralleldrive/cuid2";
import type { InferSelectModel } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { commonColumns } from "./common";
import { userTable } from "./user";
import { workspaceTable } from "./organization";

/**
 * Upload metadata table representing files uploaded to R2.
 */
export const uploadTable = sqliteTable(
  "upload",
  {
    ...commonColumns,
    id: text("id")
      .primaryKey()
      .$defaultFn(() => `upl_${createId()}`)
      .notNull(),
    userId: text("user_id")
      .references(() => userTable.id, { onDelete: "cascade" })
      .notNull(),
    workspaceId: text("workspace_id")
      .references(() => workspaceTable.id, { onDelete: "set null" }),
    key: text("key", { length: 1024 }).notNull(),
    filename: text("filename", { length: 255 }).notNull(),
    contentType: text("content_type", { length: 255 }).notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    status: text("status", { enum: ["pending", "ready", "failed"] })
      .default("pending")
      .notNull(),
    completedAt: integer("completed_at", { mode: "timestamp_ms" }),
  },
  (table) => [
    index("upload_user_idx").on(table.userId),
    index("upload_workspace_idx").on(table.workspaceId),
    index("upload_created_idx").on(table.createdAt),
  ],
);

export type Upload = InferSelectModel<typeof uploadTable>;
