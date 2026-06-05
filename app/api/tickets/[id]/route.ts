import { NextRequest, NextResponse } from "next/server";
import { createApiHandler } from "@/lib/api/handler";
import {
  getTicketById,
  updateTicket,
  deleteTicket,
} from "@/lib/db/repositories/tickets.repository";

export const GET = createApiHandler({
  get: async (_req, { params }) => {
    const ticket = await getTicketById(params.id);
    return NextResponse.json(ticket);
  },
});

export const PUT = createApiHandler({
  put: async (req, { params }) => {
    const body = await req.json();
    await updateTicket(params.id, body);
    return NextResponse.json({});
  },
});

export const DELETE = createApiHandler({
  delete: async (_req, { params }) => {
    await deleteTicket(params.id);
    return NextResponse.json({});
  },
});
