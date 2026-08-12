/**
 * Shared Type Definitions
 *
 * Generic types used across the monorepo. Import from "@repo/types".
 *
 * SWAP: Extend or replace these types to match your domain model.
 */

/* -------------------------------------------------------------------------- */
/* User                                                                        */
/* -------------------------------------------------------------------------- */

export type UserRole = "owner" | "admin" | "member" | "viewer";

export type UserStatus = "active" | "invited" | "suspended" | "deactivated";

export interface User {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: UserRole;
  status: UserStatus;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/* -------------------------------------------------------------------------- */
/* Item (generic CRUD entity)                                                  */
/* -------------------------------------------------------------------------- */

export type ItemStatus = "draft" | "active" | "in_progress" | "completed" | "archived";

export type ItemPriority = "urgent" | "high" | "medium" | "low" | "none";

export interface Item {
  id: string;
  title: string;
  description: string | null;
  status: ItemStatus;
  priority: ItemPriority;
  assigneeId: string | null;
  tags: string[];
  metadata: Record<string, unknown>;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

/* -------------------------------------------------------------------------- */
/* Audit Log                                                                   */
/* -------------------------------------------------------------------------- */

export type AuditAction =
  | "create_item"
  | "update_item"
  | "delete_item"
  | "create_user"
  | "update_user"
  | "delete_user"
  | "login"
  | "logout"
  | "update_settings"
  | "create_api_key"
  | "revoke_api_key"
  | "connect_integration"
  | "disconnect_integration"
  | string; // Allow custom actions

export interface AuditLog {
  id: string;
  actorId: string;
  actorEmail: string;
  action: AuditAction;
  entityType: string | null;
  entityId: string | null;
  details: Record<string, unknown>;
  ip: string | null;
  userAgent: string | null;
  result: "success" | "failure";
  createdAt: string;
}

/* -------------------------------------------------------------------------- */
/* API Key                                                                     */
/* -------------------------------------------------------------------------- */

export type ApiKeyScope = "read" | "write" | "admin";

export interface ApiKey {
  id: string;
  name: string;
  /** Only returned on creation — stored hashed thereafter */
  key?: string;
  /** Prefix for display (e.g., "sk_...abc") */
  prefix: string;
  scopes: ApiKeyScope[];
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdById: string;
  createdAt: string;
}

/* -------------------------------------------------------------------------- */
/* Integration                                                                 */
/* -------------------------------------------------------------------------- */

export type IntegrationStatus = "connected" | "disconnected" | "error" | "pending";

export interface Integration {
  id: string;
  provider: string;
  displayName: string;
  status: IntegrationStatus;
  config: Record<string, unknown>;
  lastSyncAt: string | null;
  error: string | null;
  createdAt: string;
  updatedAt: string;
}

/* -------------------------------------------------------------------------- */
/* Template                                                                    */
/* -------------------------------------------------------------------------- */

export interface Template {
  id: string;
  name: string;
  description: string | null;
  category: string;
  content: Record<string, unknown>;
  isPublic: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

/* -------------------------------------------------------------------------- */
/* Settings                                                                    */
/* -------------------------------------------------------------------------- */

export interface Settings {
  /** Application-level settings (name, logo, etc.) */
  app: {
    name: string;
    description: string;
    logoUrl: string | null;
    favicon: string | null;
    primaryColor: string;
  };
  /** Feature flags */
  features: Record<string, boolean>;
  /** Notification preferences */
  notifications: {
    email: boolean;
    push: boolean;
    slack: boolean;
  };
  /** Security settings */
  security: {
    mfaRequired: boolean;
    sessionTimeoutMinutes: number;
    allowedDomains: string[];
  };
}

/* -------------------------------------------------------------------------- */
/* API Response Generics                                                       */
/* -------------------------------------------------------------------------- */

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface ApiError {
  error: string;
  code?: string;
  details?: Array<{ field: string; message: string }>;
  correlationId?: string;
}

export interface ApiSuccess<T = unknown> {
  data: T;
  message?: string;
}
