import { z } from "zod";

/**
 * Maximum upload size in bytes. Mirrored in `apps/web/storage.rules` so the
 * client-side Storage SDK is rejected at the edge as well as the server.
 */
export const MAX_UPLOAD_BYTES = 100 * 1024 * 1024; // 100 MB

/**
 * Workspace-scoped file upload metadata.
 *
 * Stored at `uploads/{uploadId}` (top-level collection, filtered by
 * `workspaceId`). The bytes themselves live in Firebase Storage at
 * `workspaces/{workspaceId}/uploads/{uploadId}/{filename}`.
 *
 * No `downloadUrl` field — long-lived signed URLs leak into logs, browser
 * history, and share links. Clients fetch a fresh short-lived URL on demand
 * via `GET /api/v1/uploads/:id/url`.
 */
export const UploadSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  ownerId: z.string(),
  filename: z.string().min(1).max(255),
  contentType: z.string().min(1).max(255),
  size: z.number().int().positive().max(MAX_UPLOAD_BYTES),
  path: z.string(),
  createdAt: z.date(),
  readyAt: z.date().nullable(),
});
export type Upload = z.infer<typeof UploadSchema>;
