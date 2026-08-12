import { createId } from "@paralleldrive/cuid2";
import type { InferSelectModel } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { commonColumns } from "./common";
import { userTable } from "./user";

/**
 * Better Auth durable sessions. Better Auth expects camelCase `token`,
 * `expiresAt`, `ipAddress`, `userAgent`. Dates bound as epoch ms for D1.
 */
export const authSessionTable = sqliteTable(
  "auth_session",
  {
    ...commonColumns,
    id: text("id")
      .primaryKey()
      .$defaultFn(() => `ses_${createId()}`)
      .notNull(),
    token: text("token", { length: 128 }).notNull(),
    userId: text("user_id")
      .references(() => userTable.id)
      .notNull(),
    expiresAt: integer("expiresAt", { mode: "timestamp_ms" }).notNull(),
    ipAddress: text("ipAddress", { length: 100 }),
    userAgent: text("userAgent", { length: 600 }),
  },
  (table) => [
    index("auth_session_user_idx").on(table.userId),
    index("auth_session_expires_idx").on(table.expiresAt),
    index("auth_session_token_idx").on(table.token),
  ],
);

/** Better Auth OAuth account links. */
export const authAccountTable = sqliteTable(
  "auth_account",
  {
    ...commonColumns,
    id: text("id")
      .primaryKey()
      .$defaultFn(() => `acc_${createId()}`)
      .notNull(),
    userId: text("user_id")
      .references(() => userTable.id)
      .notNull(),
    providerId: text("providerId", { length: 50 }).notNull(),
    accountId: text("accountId", { length: 255 }).notNull(),
    // Better Auth email/password provider stores its scrypt hash here.
    // Field name must remain exactly `password` for adapter compatibility.
    password: text("password", { length: 4000 }),
    accessToken: text("accessToken", { length: 4000 }),
    refreshToken: text("refreshToken", { length: 4000 }),
    idToken: text("idToken", { length: 4000 }),
    accessTokenExpiresAt: integer("accessTokenExpiresAt", { mode: "timestamp_ms" }),
    refreshTokenExpiresAt: integer("refreshTokenExpiresAt", { mode: "timestamp_ms" }),
    scope: text("scope", { length: 1000 }),
  },
  (table) => [
    index("auth_account_user_idx").on(table.userId),
    index("auth_account_provider_idx").on(table.providerId),
    index("auth_account_provider_account_idx").on(table.providerId, table.accountId),
  ],
);

/** Better Auth verification tokens (email verify, magic link, OTP). */
export const authVerificationTokenTable = sqliteTable(
  "auth_verification_token",
  {
    ...commonColumns,
    id: text("id")
      .primaryKey()
      .$defaultFn(() => `vrt_${createId()}`)
      .notNull(),
    type: text("type", { length: 50 }),
    identifier: text("identifier", { length: 255 }).notNull(),
    value: text("value", { length: 4000 }).notNull(),
    expiresAt: integer("expiresAt", { mode: "timestamp_ms" }).notNull(),
    consumedAt: integer("consumedAt", { mode: "timestamp_ms" }),
  },
  (table) => [
    index("auth_verif_identifier_idx").on(table.identifier),
    index("auth_verif_value_idx").on(table.value),
    index("auth_verif_expires_idx").on(table.expiresAt),
  ],
);

/** Better Auth Organization plugin models. Keep these distinct from the app's
 * workspace mirror tables: Better Auth owns organization/member/invitation. */
export const authOrganizationTable = sqliteTable(
  "organization",
  {
    id: text("id").primaryKey().notNull(),
    name: text("name", { length: 255 }).notNull(),
    slug: text("slug", { length: 255 }).notNull().unique(),
    logo: text("logo", { length: 600 }),
    metadata: text("metadata", { length: 4000 }),
    createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [index("auth_organization_slug_idx").on(table.slug)],
);

export const authMemberTable = sqliteTable(
  "member",
  {
    id: text("id").primaryKey().notNull(),
    organizationId: text("organizationId").notNull(),
    userId: text("userId").notNull(),
    role: text("role", { length: 50 }).notNull(),
    createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    index("auth_member_organization_idx").on(table.organizationId),
    index("auth_member_user_idx").on(table.userId),
  ],
);

export const authInvitationTable = sqliteTable(
  "invitation",
  {
    id: text("id").primaryKey().notNull(),
    organizationId: text("organizationId").notNull(),
    email: text("email", { length: 255 }).notNull(),
    role: text("role", { length: 50 }).notNull(),
    status: text("status", { length: 50 }).notNull().default("pending"),
    expiresAt: integer("expiresAt", { mode: "timestamp_ms" }).notNull(),
    createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull(),
    inviterId: text("inviterId").notNull(),
  },
  (table) => [
    index("auth_invitation_organization_idx").on(table.organizationId),
    index("auth_invitation_email_idx").on(table.email),
    index("auth_invitation_inviter_idx").on(table.inviterId),
  ],
);

export type AuthSession = InferSelectModel<typeof authSessionTable>;
export type AuthAccount = InferSelectModel<typeof authAccountTable>;
export type AuthVerificationToken = InferSelectModel<typeof authVerificationTokenTable>;
