import { NextResponse } from "next/server";
import { z } from "zod";
import { createApiHandler } from "@/lib/create-api-handler";
import * as repo from "@/lib/messages/repository";

export const dynamic = "force-dynamic";

export const GET = createApiHandler({
  auth: "user",
  handler: async ({ workspaceId, params }) => {
    const id = (params as { id: string }).id;
    const messages = await repo.listMessages(workspaceId, id);
    return NextResponse.json({ messages });
  },
});

const CreateSchema = z.object({
  role: z.enum(["user", "assistant", "system", "tool"]).default("user"),
  content: z.string().min(1),
});

export const POST = createApiHandler({
  auth: "user",
  input: CreateSchema,
  handler: async ({ workspaceId, params, body }) => {
    const id = (params as { id: string }).id;
    const message = await repo.addMessage(workspaceId, id, body);
    return NextResponse.json({ message }, { status: 201 });
  },
});
