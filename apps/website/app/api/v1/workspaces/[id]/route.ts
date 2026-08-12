import { NextResponse } from "next/server";

import { createApiHandler } from "@/lib/create-api-handler";
import { getWorkspaceIfMember } from "@/lib/workspaces/repository";

export const dynamic = "force-dynamic";

export const GET = createApiHandler({
  auth: "session",
  handler: async ({ session, params }) => {
    const id = (params as { id: string }).id;
    const workspace = await getWorkspaceIfMember(id, session!.userId);
    return NextResponse.json({ workspace });
  },
});
