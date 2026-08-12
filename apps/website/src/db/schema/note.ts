import { createId } from "@paralleldrive/cuid2";
import type { InferSelectModel } from "drizzle-orm";
import { index, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { commonColumns } from "./common";
import { userTable } from "./user";

/**
 * Sample app table proving the D1 CRUD path behind auth. HumanOrVibe will
 * replace/augment this with rounds, guesses, scores, challenges, etc.
 */
export const noteTable = sqliteTable(
  "note",
  {
    ...commonColumns,
    id: text("id")
      .primaryKey()
      .$defaultFn(() => `note_${createId()}`)
      .notNull(),
    userId: text("user_id")
      .references(() => userTable.id, { onDelete: "cascade" })
      .notNull(),
    title: text("title", { length: 255 }).notNull(),
    body: text("body", { length: 4000 }).notNull(),
  },
  (table) => [
    index("note_user_idx").on(table.userId),
    index("note_created_idx").on(table.createdAt),
  ],
);

export type Note = InferSelectModel<typeof noteTable>;
