import { NextRequest, NextResponse } from "next/server";
import { createApiHandler } from "@/lib/api/handler";
import { createTicket } from "@/lib/db/repositories/tickets.repository";

export const POST = createApiHandler({
  post: async (req) => {
    const body = await req.json();
    await createTicket(body);
    return NextResponse.json({});
  },
});
