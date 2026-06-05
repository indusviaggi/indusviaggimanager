import { NextResponse } from "next/server";
import { createApiHandler } from "@/lib/api/handler";
import { getAllAirlines } from "@/lib/db/repositories/flights.repository";

export const GET = createApiHandler({
  get: async () => {
    const flights = await getAllAirlines();
    return NextResponse.json(flights);
  },
});
