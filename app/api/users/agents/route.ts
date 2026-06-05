import { NextResponse } from "next/server";
import { createApiHandler } from "@/lib/api/handler";
import { getAllAgents } from "@/lib/db/repositories/users.repository";

export const GET = createApiHandler({
  get: async () => {
    const agents = await getAllAgents();
    return NextResponse.json(agents);
  },
});
