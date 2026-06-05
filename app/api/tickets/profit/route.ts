import { NextRequest, NextResponse } from "next/server";
import { createApiHandler } from "@/lib/api/handler";
import {
  getProfitTickets,
  getBookings,
} from "@/lib/db/repositories/tickets.repository";

export const GET = createApiHandler({
  get: async () => {
    const tickets = await getBookings();
    return NextResponse.json(tickets);
  },
});

export const POST = createApiHandler({
  post: async (req) => {
    const body = await req.json();
    const tickets = await getProfitTickets(body);
    return NextResponse.json(tickets);
  },
});
