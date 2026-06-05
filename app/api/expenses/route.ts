import { NextResponse } from "next/server";
import { createApiHandler } from "@/lib/api/handler";
import { getAllExpenses } from "@/lib/db/repositories/expenses.repository";

export const POST = createApiHandler({
  post: async (req) => {
    const body = await req.json();
    const expenses = await getAllExpenses(body);
    return NextResponse.json(expenses);
  },
});
