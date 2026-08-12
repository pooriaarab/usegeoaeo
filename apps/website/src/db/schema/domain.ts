/**
 * Product-domain tables for master-template parity (Wave 2).
 * Maps legacy Firestore collections → D1 SQLite via Drizzle.
 * JSON columns store structured blobs (toolAllowlist, entitlements, etc.).
 */
import { createId } from "@paralleldrive/cuid2";
import type { InferSelectModel } from "drizzle-orm";
import { index, integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

import { commonColumns } from "./common";
import { workspaceTable } from "./organization";
import { userTable } from "./user";

const ts = (name: string) => integer(name, { mode: "timestamp_ms" as const });

export const agentTable = sqliteTable(
  "agent",
  {
    ...commonColumns,
    id: text("id")
      .primaryKey()
      .$defaultFn(() => `agt_${createId()}`)
      .notNull(),
    workspaceId: text("workspace_id")
      .references(() => workspaceTable.id, { onDelete: "cascade" })
      .notNull(),
    name: text("name", { length: 120 }).notNull(),
    description: text("description", { length: 2000 }).default("").notNull(),
    model: text("model", { length: 120 }).notNull(),
    systemPrompt: text("system_prompt").default("").notNull(),
    isDefaultAiChat: integer("is_default_ai_chat", { mode: "boolean" }).default(false).notNull(),
    toolAllowlistJson: text("tool_allowlist_json").default("[]").notNull(),
    publicKey: text("public_key"),
    publicEnabled: integer("public_enabled", { mode: "boolean" }).default(false).notNull(),
    lastUsedAt: ts("last_used_at"),
    archivedAt: ts("archived_at"),
  },
  (t) => [
    index("agent_workspace_idx").on(t.workspaceId),
    index("agent_public_key_idx").on(t.publicKey),
  ],
);

export const agentMemoryTable = sqliteTable(
  "agent_memory",
  {
    ...commonColumns,
    id: text("id")
      .primaryKey()
      .$defaultFn(() => `mem_${createId()}`)
      .notNull(),
    workspaceId: text("workspace_id")
      .references(() => workspaceTable.id, { onDelete: "cascade" })
      .notNull(),
    agentId: text("agent_id")
      .references(() => agentTable.id, { onDelete: "cascade" })
      .notNull(),
    key: text("key", { length: 200 }).notNull(),
    valueJson: text("value_json").notNull(),
    embeddingJson: text("embedding_json"),
    expiresAt: ts("expires_at"),
  },
  (t) => [
    index("agent_memory_workspace_idx").on(t.workspaceId),
    index("agent_memory_agent_idx").on(t.agentId),
    uniqueIndex("agent_memory_agent_key_unique").on(t.agentId, t.key),
  ],
);

export const skillTable = sqliteTable(
  "agent_skill",
  {
    ...commonColumns,
    id: text("id")
      .primaryKey()
      .$defaultFn(() => `skl_${createId()}`)
      .notNull(),
    workspaceId: text("workspace_id")
      .references(() => workspaceTable.id, { onDelete: "cascade" })
      .notNull(),
    agentId: text("agent_id")
      .references(() => agentTable.id, { onDelete: "cascade" })
      .notNull(),
    name: text("name", { length: 120 }).notNull(),
    description: text("description", { length: 2000 }).default("").notNull(),
    body: text("body").notNull(),
    enabled: integer("enabled", { mode: "boolean" }).default(true).notNull(),
  },
  (t) => [
    index("skill_workspace_idx").on(t.workspaceId),
    index("skill_agent_idx").on(t.agentId),
  ],
);

export const toolTable = sqliteTable(
  "tool",
  {
    ...commonColumns,
    id: text("id")
      .primaryKey()
      .$defaultFn(() => `tool_${createId()}`)
      .notNull(),
    workspaceId: text("workspace_id")
      .references(() => workspaceTable.id, { onDelete: "cascade" })
      .notNull(),
    name: text("name", { length: 120 }).notNull(),
    description: text("description", { length: 2000 }).default("").notNull(),
    inputSchemaJson: text("input_schema_json").default("{}").notNull(),
    kind: text("kind", { enum: ["builtin", "integration"] }).notNull(),
    integrationId: text("integration_id"),
    enabled: integer("enabled", { mode: "boolean" }).default(true).notNull(),
  },
  (t) => [
    index("tool_workspace_idx").on(t.workspaceId),
    uniqueIndex("tool_workspace_name_unique").on(t.workspaceId, t.name),
  ],
);

export const agentIntegrationTable = sqliteTable(
  "agent_integration",
  {
    ...commonColumns,
    id: text("id")
      .primaryKey()
      .$defaultFn(() => `int_${createId()}`)
      .notNull(),
    workspaceId: text("workspace_id")
      .references(() => workspaceTable.id, { onDelete: "cascade" })
      .notNull(),
    provider: text("provider", { length: 50 }).notNull(),
    displayName: text("display_name", { length: 120 }).notNull(),
    status: text("status", { enum: ["connected", "disconnected", "error"] }).notNull(),
    credentialsRef: text("credentials_ref").notNull(),
    scopesJson: text("scopes_json").default("[]").notNull(),
    enabledToolsJson: text("enabled_tools_json").default("[]").notNull(),
    connectedAt: ts("connected_at"),
    disconnectedAt: ts("disconnected_at"),
  },
  (t) => [index("agent_integration_workspace_idx").on(t.workspaceId)],
);

export const threadTable = sqliteTable(
  "thread",
  {
    ...commonColumns,
    id: text("id")
      .primaryKey()
      .$defaultFn(() => `thr_${createId()}`)
      .notNull(),
    workspaceId: text("workspace_id")
      .references(() => workspaceTable.id, { onDelete: "cascade" })
      .notNull(),
    agentId: text("agent_id")
      .references(() => agentTable.id, { onDelete: "cascade" })
      .notNull(),
    actor: text("actor", { enum: ["admin", "member", "visitor"] }).notNull(),
    actorId: text("actor_id").notNull(),
    visibility: text("visibility", { enum: ["internal", "public"] }).default("internal").notNull(),
    title: text("title", { length: 200 }).default("").notNull(),
    status: text("status", { enum: ["open", "archived"] }).default("open").notNull(),
    messageCount: integer("message_count").default(0).notNull(),
    metadataJson: text("metadata_json").default("{}").notNull(),
    lastMessageAt: ts("last_message_at"),
    archivedAt: ts("archived_at"),
  },
  (t) => [
    index("thread_workspace_idx").on(t.workspaceId),
    index("thread_agent_idx").on(t.agentId),
    index("thread_actor_idx").on(t.actorId),
  ],
);

export const messageTable = sqliteTable(
  "message",
  {
    ...commonColumns,
    id: text("id")
      .primaryKey()
      .$defaultFn(() => `msg_${createId()}`)
      .notNull(),
    threadId: text("thread_id")
      .references(() => threadTable.id, { onDelete: "cascade" })
      .notNull(),
    workspaceId: text("workspace_id")
      .references(() => workspaceTable.id, { onDelete: "cascade" })
      .notNull(),
    agentId: text("agent_id")
      .references(() => agentTable.id, { onDelete: "cascade" })
      .notNull(),
    role: text("role", { enum: ["user", "assistant", "tool", "system"] }).notNull(),
    content: text("content").notNull(),
    toolName: text("tool_name"),
    toolCallId: text("tool_call_id"),
    usageInputTokens: integer("usage_input_tokens"),
    usageOutputTokens: integer("usage_output_tokens"),
    metadataJson: text("metadata_json").default("{}").notNull(),
  },
  (t) => [
    index("message_thread_idx").on(t.threadId),
    index("message_workspace_idx").on(t.workspaceId),
    index("message_created_idx").on(t.createdAt),
  ],
);

export const itemTable = sqliteTable(
  "item",
  {
    ...commonColumns,
    id: text("id")
      .primaryKey()
      .$defaultFn(() => `itm_${createId()}`)
      .notNull(),
    workspaceId: text("workspace_id")
      .references(() => workspaceTable.id, { onDelete: "cascade" })
      .notNull(),
    type: text("type", { length: 80 }).notNull(),
    title: text("title", { length: 255 }).default("").notNull(),
    dataJson: text("data_json").default("{}").notNull(),
    createdByUserId: text("created_by_user_id").references(() => userTable.id, {
      onDelete: "set null",
    }),
    archivedAt: ts("archived_at"),
  },
  (t) => [
    index("item_workspace_idx").on(t.workspaceId),
    index("item_type_idx").on(t.type),
  ],
);

export const webhookTable = sqliteTable(
  "webhook",
  {
    ...commonColumns,
    id: text("id")
      .primaryKey()
      .$defaultFn(() => `wh_${createId()}`)
      .notNull(),
    workspaceId: text("workspace_id")
      .references(() => workspaceTable.id, { onDelete: "cascade" })
      .notNull(),
    agentId: text("agent_id")
      .references(() => agentTable.id, { onDelete: "cascade" })
      .notNull(),
    url: text("url", { length: 2048 }).notNull(),
    secretHash: text("secret_hash").notNull(),
    eventsJson: text("events_json").notNull(),
    enabled: integer("enabled", { mode: "boolean" }).default(true).notNull(),
    lastDeliveredAt: ts("last_delivered_at"),
    lastFailureAt: ts("last_failure_at"),
    failureCount: integer("failure_count").default(0).notNull(),
  },
  (t) => [
    index("webhook_workspace_idx").on(t.workspaceId),
    index("webhook_agent_idx").on(t.agentId),
  ],
);

export const auditLogTable = sqliteTable(
  "audit_log",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => `aud_${createId()}`)
      .notNull(),
    workspaceId: text("workspace_id")
      .references(() => workspaceTable.id, { onDelete: "cascade" })
      .notNull(),
    actorUserId: text("actor_user_id"),
    action: text("action", { length: 120 }).notNull(),
    targetType: text("target_type", { length: 80 }),
    targetId: text("target_id"),
    metaJson: text("meta_json").default("{}").notNull(),
    createdAt: ts("created_at").$defaultFn(() => new Date()).notNull(),
  },
  (t) => [
    index("audit_workspace_idx").on(t.workspaceId),
    index("audit_created_idx").on(t.createdAt),
    index("audit_actor_idx").on(t.actorUserId),
  ],
);

export const settingTable = sqliteTable(
  "setting",
  {
    ...commonColumns,
    id: text("id")
      .primaryKey()
      .$defaultFn(() => `set_${createId()}`)
      .notNull(),
    workspaceId: text("workspace_id")
      .references(() => workspaceTable.id, { onDelete: "cascade" })
      .notNull(),
    key: text("key", { length: 120 }).notNull(),
    valueJson: text("value_json").notNull(),
  },
  (t) => [uniqueIndex("setting_workspace_key_unique").on(t.workspaceId, t.key)],
);

export const billingTable = sqliteTable(
  "billing",
  {
    ...commonColumns,
    workspaceId: text("workspace_id")
      .primaryKey()
      .references(() => workspaceTable.id, { onDelete: "cascade" })
      .notNull(),
    plan: text("plan", { enum: ["free", "pro", "team"] }).default("free").notNull(),
    status: text("status", { length: 40 }).default("active").notNull(),
    customerId: text("customer_id"),
    subscriptionId: text("subscription_id"),
    currentPeriodEnd: ts("current_period_end"),
    cancelAtPeriodEnd: integer("cancel_at_period_end", { mode: "boolean" }).default(false).notNull(),
    entitlementsJson: text("entitlements_json")
      .default('{"aiTokensPerMonth":0,"members":1}')
      .notNull(),
  },
  (t) => [index("billing_customer_idx").on(t.customerId)],
);

export const billingEventTable = sqliteTable(
  "billing_event",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => `bev_${createId()}`)
      .notNull(),
    type: text("type", { length: 120 }).notNull(),
    payloadJson: text("payload_json").default("{}").notNull(),
    receivedAt: ts("received_at").$defaultFn(() => new Date()).notNull(),
    appliedAt: ts("applied_at"),
    attempts: integer("attempts").default(0).notNull(),
    error: text("error"),
  },
  (t) => [index("billing_event_type_idx").on(t.type)],
);

export const visitorSessionTable = sqliteTable(
  "visitor_session",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => `vis_${createId()}`)
      .notNull(),
    agentId: text("agent_id")
      .references(() => agentTable.id, { onDelete: "cascade" })
      .notNull(),
    workspaceId: text("workspace_id")
      .references(() => workspaceTable.id, { onDelete: "cascade" })
      .notNull(),
    ip: text("ip").default("").notNull(),
    userAgent: text("user_agent").default("").notNull(),
    country: text("country").default("").notNull(),
    firstSeenAt: ts("first_seen_at").$defaultFn(() => new Date()).notNull(),
    lastSeenAt: ts("last_seen_at").$defaultFn(() => new Date()).notNull(),
    messageCount: integer("message_count").default(0).notNull(),
    tokenUsage: integer("token_usage").default(0).notNull(),
    captchaPassedAt: ts("captcha_passed_at"),
  },
  (t) => [
    index("visitor_session_agent_idx").on(t.agentId),
    index("visitor_session_workspace_idx").on(t.workspaceId),
  ],
);

export const apiKeyTable = sqliteTable(
  "api_key",
  {
    ...commonColumns,
    id: text("id")
      .primaryKey()
      .$defaultFn(() => `key_${createId()}`)
      .notNull(),
    workspaceId: text("workspace_id")
      .references(() => workspaceTable.id, { onDelete: "cascade" })
      .notNull(),
    name: text("name", { length: 120 }).notNull(),
    keyHash: text("key_hash").notNull(),
    prefix: text("prefix", { length: 16 }).notNull(),
    createdByUserId: text("created_by_user_id").references(() => userTable.id, {
      onDelete: "set null",
    }),
    lastUsedAt: ts("last_used_at"),
    revokedAt: ts("revoked_at"),
  },
  (t) => [
    index("api_key_workspace_idx").on(t.workspaceId),
    uniqueIndex("api_key_hash_unique").on(t.keyHash),
  ],
);

export const outboxTable = sqliteTable(
  "outbox",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => `obx_${createId()}`)
      .notNull(),
    type: text("type", { length: 80 }).notNull(),
    payloadJson: text("payload_json").notNull(),
    status: text("status", { enum: ["pending", "sent", "failed"] }).default("pending").notNull(),
    attempts: integer("attempts").default(0).notNull(),
    lastError: text("last_error"),
    createdAt: ts("created_at").$defaultFn(() => new Date()).notNull(),
    sentAt: ts("sent_at"),
  },
  (t) => [
    index("outbox_status_idx").on(t.status),
    index("outbox_created_idx").on(t.createdAt),
  ],
);

// silence unused real import if tree-shaken oddly
void real;

export type Agent = InferSelectModel<typeof agentTable>;
export type AgentMemory = InferSelectModel<typeof agentMemoryTable>;
export type Skill = InferSelectModel<typeof skillTable>;
export type Tool = InferSelectModel<typeof toolTable>;
export type AgentIntegration = InferSelectModel<typeof agentIntegrationTable>;
export type Thread = InferSelectModel<typeof threadTable>;
export type Message = InferSelectModel<typeof messageTable>;
export type Item = InferSelectModel<typeof itemTable>;
export type Webhook = InferSelectModel<typeof webhookTable>;
export type AuditLog = InferSelectModel<typeof auditLogTable>;
export type Setting = InferSelectModel<typeof settingTable>;
export type Billing = InferSelectModel<typeof billingTable>;
export type BillingEvent = InferSelectModel<typeof billingEventTable>;
export type VisitorSession = InferSelectModel<typeof visitorSessionTable>;
export type ApiKey = InferSelectModel<typeof apiKeyTable>;
export type Outbox = InferSelectModel<typeof outboxTable>;
