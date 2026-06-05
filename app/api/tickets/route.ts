import { NextRequest, NextResponse } from "next/server";
import { createApiHandler } from "@/lib/api/handler";
import {
  getAllTickets,
  findAndUpdateTicket,
} from "@/lib/db/repositories/tickets.repository";

export const POST = createApiHandler({
  post: async (req) => {
    const body = await req.json();
    const tickets = await getAllTickets(body);
    return NextResponse.json(tickets);
  },
});

export const PUT = createApiHandler({
  put: async (req) => {
    const body = await req.json();
    await findAndUpdateTicket(body);
    return NextResponse.json({});
  },
});
