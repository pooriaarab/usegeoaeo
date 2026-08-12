import { z } from "zod";

/**
 * VisitorSession — anonymous end-user session against a public-enabled
 * agent. Created on the first POST /api/v1/public/threads call; identity
 * is carried via the `mt_visitor` HttpOnly cookie.
 *
 * Caps (`messageCount` and `tokenUsage`) are hard ceilings enforced by the
 * public API to prevent runaway abuse from a single visitor. CAPTCHA is
 * required on the FIRST message of each session unless `captchaPassedAt`
 * is set.
 */
export const VisitorSessionSchema = z.object({
  id: z.string().min(1),
  agentId: z.string().min(1),
  workspaceId: z.string().min(1),
  ip: z.string().default(""),
  userAgent: z.string().default(""),
  country: z.string().default(""),
  firstSeenAt: z.date(),
  lastSeenAt: z.date(),
  messageCount: z.number().int().nonnegative().default(0),
  tokenUsage: z.number().int().nonnegative().default(0),
  captchaPassedAt: z.date().nullable().default(null),
});
export type VisitorSession = z.infer<typeof VisitorSessionSchema>;

/** Hard ceilings — defaults; overridable per-deployment via env if needed. */
export const VISITOR_MESSAGE_LIMIT = 50;
export const VISITOR_TOKEN_LIMIT = 100_000;
