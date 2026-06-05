import { NextResponse } from "next/server";
import { createApiHandler } from "@/lib/api/handler";
import { createAgentsOperation } from "@/lib/db/repositories/agents-operations.repository";

export const POST = createApiHandler({
  post: async (req) => {
    const body = await req.json();
    await createAgentsOperation(body);
    return NextResponse.json({});
  },
});
