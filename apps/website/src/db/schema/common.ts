import { sql } from "drizzle-orm";
import { integer } from "drizzle-orm/sqlite-core";

/**
 * Shared columns. Use integer timestamp_ms so Drizzle converts Date -> epoch ms
 * for D1 binding (avoiding the D1 Date binding errors the Content Rabbit team hit).
 */
export const commonColumns = {
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .$onUpdateFn(() => new Date())
    .notNull(),
  updateCounter: integer("update_counter")
    .default(0)
    .$onUpdate(() => sql`update_counter + 1`),
};
