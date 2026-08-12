/**
 * BlogBat/Supportsheep-style declarative API handler (CF-only, no Firebase).
 */
import { type NextRequest, NextResponse } from "next/server";
import type { ZodSchema } from "zod";

import {
  AuthError,
  handleApiError,
  roleSatisfies,
  validateInput,
  type SessionData,
} from "@/lib/api-utils";
import { verifyRequest } from "@/lib/session";
import { resolveTenantForUser } from "@/lib/tenancy/repository";

type AuthLevel = "user" | "admin" | "session" | "none";

interface HandlerConfig<TBody = unknown, TParams = Record<string, string>> {
  auth?: AuthLevel;
  input?: ZodSchema<TBody>;
  handler: (ctx: {
    request: NextRequest;
    session: SessionData | null;
    body: TBody;
    params: TParams;
    workspaceId: string;
    role: string | null;
  }) => Promise<NextResponse>;
}

export function createApiHandler<TBody = unknown, TParams = Record<string, string>>(
  config: HandlerConfig<TBody, TParams>,
) {
  const authLevel: AuthLevel = config.auth ?? "user";

  return async function routeHandler(
    request: NextRequest,
    context?: { params?: Promise<TParams> },
  ): Promise<NextResponse> {
    try {
      let session: SessionData | null = null;
      let workspaceId = "";
      let role: string | null = null;

      if (authLevel !== "none") {
        session = await verifyRequest();
        if (authLevel === "session") {
          // login only — no membership required
        } else {
          const preferred = request.headers.get("x-workspace-id");
          const tenant = await resolveTenantForUser(session.userId, preferred);
          workspaceId = tenant.workspaceId;
          role = tenant.role;
          if (authLevel === "admin" && !roleSatisfies(role, "admin")) {
            throw new AuthError("admin access required", 403);
          }
        }
      }

      let body = undefined as TBody;
      if (config.input && request.method !== "GET" && request.method !== "HEAD") {
        const raw = await request.json().catch(() => null);
        const parsed = validateInput(config.input, raw);
        if (!parsed.success) return parsed.response;
        body = parsed.data;
      }

      const params = (context?.params ? await context.params : {}) as TParams;
      return await config.handler({
        request,
        session,
        body: body as TBody,
        params,
        workspaceId,
        role,
      });
    } catch (err) {
      return handleApiError(err);
    }
  };
}
