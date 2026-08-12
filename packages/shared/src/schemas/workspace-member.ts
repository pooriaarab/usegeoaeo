import { z } from "zod";

export const WorkspaceMemberRoleSchema = z.enum([
  "owner",
  "admin",
  "member",
]);
export type WorkspaceMemberRole = z.infer<typeof WorkspaceMemberRoleSchema>;

export const WorkspaceMemberStatusSchema = z.enum(["active", "pending"]);
export type WorkspaceMemberStatus = z.infer<typeof WorkspaceMemberStatusSchema>;

export const WorkspaceMemberSchema = z.object({
  /** Deterministic id: `${workspaceId}_${userId}`. */
  id: z.string(),
  workspaceId: z.string(),
  userId: z.string(),
  role: WorkspaceMemberRoleSchema,
  invitedBy: z.string().nullable(),
  joinedAt: z.date().nullable(),
  status: WorkspaceMemberStatusSchema,
  /** Email captured at invite time (used to display pending invites pre-signup). */
  email: z.string().email().nullable().default(null),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type WorkspaceMember = z.infer<typeof WorkspaceMemberSchema>;

/** Build the deterministic doc id used in Firestore + rule helpers. */
export function workspaceMemberDocId(
  workspaceId: string,
  userId: string,
): string {
  return `${workspaceId}_${userId}`;
}
