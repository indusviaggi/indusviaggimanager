import { NextResponse } from "next/server";
import { createApiHandler } from "@/lib/api/handler";
import { getTicketsByAgent } from "@/lib/db/repositories/tickets.repository";

export const POST = createApiHandler({
  post: async () => {
    const tickets = await getTicketsByAgent();
    return NextResponse.json(tickets);
  },
});
