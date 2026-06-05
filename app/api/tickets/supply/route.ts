import { NextResponse } from "next/server";
import { createApiHandler } from "@/lib/api/handler";
import { getTicketsForSupply } from "@/lib/db/repositories/tickets.repository";

export const POST = createApiHandler({
  post: async (req) => {
    const body = await req.json();
    const tickets = await getTicketsForSupply(body);
    return NextResponse.json(tickets);
  },
});
