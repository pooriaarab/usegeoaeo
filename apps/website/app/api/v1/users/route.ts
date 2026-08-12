import { NextResponse } from "next/server";
import { createApiHandler } from "@/lib/create-api-handler";
import { listMembers } from "@/lib/workspaces/repository";

export const dynamic = "force-dynamic";

/** Workspace members as "users" for product parity. */
export const GET = createApiHandler({
  auth: "user",
  handler: async ({ workspaceId }) => {
    const members = await listMembers(workspaceId);
    return NextResponse.json({ users: members });
  },
});
