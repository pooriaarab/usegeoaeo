import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { anonymous, organization } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import "server-only";

import { getDB, getDBRaw } from "@/db";
import {
  authAccountTable,
  authInvitationTable,
  authMemberTable,
  authOrganizationTable,
  authSessionTable,
  authVerificationTokenTable,
} from "@/db/schema/auth";
import { workspaceMemberTable, workspaceTable } from "@/db/schema/organization";
import { userTable } from "@/db/schema/user";

function getBaseURL(): string {
  if (process.env.NEXT_PUBLIC_BETTER_AUTH_URL) return process.env.NEXT_PUBLIC_BETTER_AUTH_URL;
  if (process.env.NODE_ENV === "production") return "https://example.com";
  return "http://localhost:3000";
}

function getTrustedOrigins(): string[] {
  const origins = [
    "http://localhost:3000",
    "http://localhost:8787",
    "http://localhost:8788",
  ];
  if (process.env.NEXT_PUBLIC_BETTER_AUTH_URL) origins.push(process.env.NEXT_PUBLIC_BETTER_AUTH_URL);
  return [...new Set(origins)];
}

function getAuthSecret(): string {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (process.env.NODE_ENV === "production" && !secret) {
    throw new Error("BETTER_AUTH_SECRET is required in production");
  }
  return secret || "development-secret-not-for-production";
}

const socialProviders: Record<string, Record<string, unknown>> = {};
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  socialProviders.google = {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  };
}

/**
 * Build Better Auth only inside an actual request/runtime context.
 *
 * Next imports route modules while collecting build metadata. Instantiating
 * Better Auth at module scope would make its Drizzle adapter initialize local
 * D1/Miniflare during the build. A lazy singleton preserves one auth instance
 * per Worker isolate without touching bindings at build time.
 */
async function createAuth() {
  return betterAuth({
    database: drizzleAdapter(await getDBRaw(), {
      provider: "sqlite",
      // Required for D1/Workers: Better Auth must not use nested transactions.
      transaction: false,
      schema: {
        user: userTable,
        session: authSessionTable,
        account: authAccountTable,
        verification: authVerificationTokenTable,
        organization: authOrganizationTable,
        member: authMemberTable,
        invitation: authInvitationTable,
      },
    }),
    baseURL: getBaseURL(),
    secret: getAuthSecret(),
    trustedOrigins: getTrustedOrigins(),

    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
    },

    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },

    socialProviders,

    plugins: [
      anonymous(),
      organization({
        allowUserToCreateOrganization: true,
        organizationHooks: {
          beforeCreateOrganization: async ({ organization: org }) => {
            const slug = String(org.slug || org.name || "")
              .toLowerCase()
              .replace(/[^a-z0-9-]+/g, "-")
              .replace(/^-+|-+$/g, "");
            return { data: { ...org, slug } };
          },
          // Mirror Better Auth organization -> app workspace tables. Better
          // Auth owns user/session/organization/member; app tables are a
          // query-friendly tenant mirror (per the Opus architecture review).
          afterCreateOrganization: async ({ organization: org, user }) => {
            const db = await getDB();
            await db
              .insert(workspaceTable)
              .values({ id: org.id, name: org.name, slug: String(org.slug ?? org.name) })
              .onConflictDoNothing();
            await db
              .insert(workspaceMemberTable)
              .values({ workspaceId: org.id, userId: user.id, role: "owner" })
              .onConflictDoNothing();
          },
          afterUpdateOrganization: async ({ organization: org }) => {
            if (!org) return;
            const db = await getDB();
            await db
              .update(workspaceTable)
              .set({ name: org.name, slug: String(org.slug ?? org.name) })
              .where(eq(workspaceTable.id, org.id));
          },
        },
      }),
    ],
  });
}

let authPromise: ReturnType<typeof createAuth> | undefined;

/** Returns the singleton Better Auth instance for the current Worker isolate. */
export function getAuth(): ReturnType<typeof createAuth> {
  authPromise ??= createAuth();
  return authPromise;
}
