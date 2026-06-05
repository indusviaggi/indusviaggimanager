import { NextResponse } from "next/server";
import { createApiHandler } from "@/lib/api/handler";
import { deleteAgentsOperation } from "@/lib/db/repositories/agents-operations.repository";

export const DELETE = createApiHandler({
  delete: async (_req, { params }) => {
    await deleteAgentsOperation(params.id);
    return NextResponse.json({});
  },
});
