import { NextResponse } from "next/server";
import { createApiHandler } from "@/lib/api/handler";
import {
  getAirlineById,
  updateAirline,
  deleteAirline,
} from "@/lib/db/repositories/flights.repository";

export const GET = createApiHandler({
  get: async (_req, { params }) => {
    const flight = await getAirlineById(params.id);
    return NextResponse.json(flight);
  },
});

export const PUT = createApiHandler({
  put: async (req, { params }) => {
    const body = await req.json();
    await updateAirline(params.id, body);
    return NextResponse.json({});
  },
});

export const DELETE = createApiHandler({
  delete: async (_req, { params }) => {
    await deleteAirline(params.id);
    return NextResponse.json({});
  },
});
