import { NextResponse } from "next/server";
import { createApiHandler } from "@/lib/api/handler";
import { getAllOperations } from "@/lib/db/repositories/operations.repository";

export const POST = createApiHandler({
  post: async (req) => {
    const body = await req.json();
    const operations = await getAllOperations(body);
    return NextResponse.json(operations);
  },
});
