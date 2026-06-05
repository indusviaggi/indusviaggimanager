import { NextResponse } from "next/server";
import { createApiHandler } from "@/lib/api/handler";
import { getAllAgentsOperations } from "@/lib/db/repositories/agents-operations.repository";

export const POST = createApiHandler({
  post: async (req) => {
    const body = await req.json();
    const operations = await getAllAgentsOperations(body);
    return NextResponse.json(operations);
  },
});
