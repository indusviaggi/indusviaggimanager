import { NextResponse } from "next/server";
import { createApiHandler } from "@/lib/api/handler";
import { createOperation } from "@/lib/db/repositories/operations.repository";

export const POST = createApiHandler({
  post: async (req) => {
    const body = await req.json();
    await createOperation(body);
    return NextResponse.json({});
  },
});
