import { headers } from "next/headers";
import "server-only";

import { getAuth } from "@/server/auth";
import { AuthError, type SessionData } from "@/lib/api-utils";

export async function verifyRequest(): Promise<SessionData> {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    throw new AuthError("unauthorized", 401);
  }
  return {
    userId: session.user.id,
    email: session.user.email ?? null,
    name: session.user.name ?? null,
  };
}
