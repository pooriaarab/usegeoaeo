import { NextResponse } from "next/server";
import { z } from "zod";

import { createApiHandler } from "@/lib/create-api-handler";
import { listWorkspacesForUser } from "@/lib/tenancy/repository";
import { createWorkspaceForUser } from "@/lib/workspaces/repository";

export const dynamic = "force-dynamic";

const CreateSchema = z.object({
  name: z.string().min(1).max(120),
});

export const GET = createApiHandler({
  auth: "session",
  handler: async ({ session }) => {
    const workspaces = await listWorkspacesForUser(session!.userId);
    return NextResponse.json({ workspaces });
  },
});

export const POST = createApiHandler({
  auth: "session",
  input: CreateSchema,
  handler: async ({ session, body }) => {
    const workspace = await createWorkspaceForUser({
      userId: session!.userId,
      name: body.name,
    });
    return NextResponse.json({ workspace }, { status: 201 });
  },
});
