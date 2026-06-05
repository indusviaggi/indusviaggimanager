import { NextResponse } from "next/server";
import { createApiHandler } from "@/lib/api/handler";
import { deleteOperation } from "@/lib/db/repositories/operations.repository";

export const DELETE = createApiHandler({
  delete: async (_req, { params }) => {
    await deleteOperation(params.id);
    return NextResponse.json({});
  },
});
