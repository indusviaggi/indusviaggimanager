import { NextResponse } from "next/server";
import { createApiHandler } from "@/lib/api/handler";
import { getFlightsTickets } from "@/lib/db/repositories/tickets.repository";

export const POST = createApiHandler({
  post: async () => {
    const tickets = await getFlightsTickets();
    return NextResponse.json(tickets);
  },
});
