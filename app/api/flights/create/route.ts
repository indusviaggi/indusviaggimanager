import { NextResponse } from "next/server";
import { createApiHandler } from "@/lib/api/handler";
import { createAirline } from "@/lib/db/repositories/flights.repository";

export const POST = createApiHandler({
  post: async (req) => {
    const body = await req.json();
    await createAirline(body);
    return NextResponse.json({});
  },
});
