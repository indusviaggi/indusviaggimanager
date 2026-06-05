import { NextResponse } from "next/server";
import { createApiHandler } from "@/lib/api/handler";
import { createExpense } from "@/lib/db/repositories/expenses.repository";

export const POST = createApiHandler({
  post: async (req) => {
    const body = await req.json();
    await createExpense(body);
    return NextResponse.json({});
  },
});
