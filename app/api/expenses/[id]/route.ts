import { NextResponse } from "next/server";
import { createApiHandler } from "@/lib/api/handler";
import {
  getExpenseById,
  updateExpense,
  deleteExpense,
} from "@/lib/db/repositories/expenses.repository";

export const GET = createApiHandler({
  get: async (_req, { params }) => {
    const expense = await getExpenseById(params.id);
    return NextResponse.json(expense);
  },
});

export const PUT = createApiHandler({
  put: async (req, { params }) => {
    const body = await req.json();
    await updateExpense(params.id, body);
    return NextResponse.json({});
  },
});

export const DELETE = createApiHandler({
  delete: async (_req, { params }) => {
    await deleteExpense(params.id);
    return NextResponse.json({});
  },
});
