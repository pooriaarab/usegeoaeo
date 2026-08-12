import { NextResponse } from "next/server";
import type { ZodIssue, ZodSchema } from "zod";

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

export type SessionData = {
  userId: string;
  email: string | null;
  name: string | null;
};

/** owner > admin > member > viewer > guest */
const ROLE_ORDER = ["guest", "viewer", "member", "admin", "owner"] as const;

export function roleSatisfies(actual: string, required: string): boolean {
  const a = ROLE_ORDER.indexOf(actual as (typeof ROLE_ORDER)[number]);
  const b = ROLE_ORDER.indexOf(required as (typeof ROLE_ORDER)[number]);
  if (a < 0 || b < 0) return actual === required;
  return a >= b;
}

export function formatValidationError(error: { issues: ZodIssue[] }): NextResponse {
  return NextResponse.json(
    {
      error: "Validation failed",
      details: error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      })),
    },
    { status: 400 },
  );
}

export function validateInput<T>(
  schema: ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; response: NextResponse } {
  const result = schema.safeParse(data);
  if (!result.success) return { success: false, response: formatValidationError(result.error) };
  return { success: true, data: result.data };
}

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  if (error && typeof error === "object" && "issues" in error) {
    return formatValidationError(error as { issues: ZodIssue[] });
  }
  console.error("[api]", error);
  const message = error instanceof Error ? error.message : "Internal error";
  return NextResponse.json({ error: message }, { status: 500 });
}
