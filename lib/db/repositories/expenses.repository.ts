import { connectDB } from "@/lib/db/connection";
import { getModels } from "@/lib/db/models";
import type { DateFilter } from "./tickets.repository";

export async function getAllExpenses(filters: DateFilter) {
  await connectDB();
  const { Expenses } = getModels();
  const filter = { [filters.type]: { $gte: filters.start, $lte: filters.end } };
  return Expenses.find(filter).sort({ createdAt: -1 });
}

export async function getExpenseById(id: string) {
  await connectDB();
  const { Expenses } = getModels();
  return Expenses.findById(id);
}

export async function createExpense(params: Record<string, unknown>) {
  await connectDB();
  const { Expenses } = getModels();
  const expense = new Expenses(params);
  await expense.save();
}

export async function updateExpense(id: string, params: Record<string, unknown>) {
  await connectDB();
  const { Expenses } = getModels();
  await Expenses.findByIdAndUpdate(id, params);
}

export async function deleteExpense(id: string) {
  await connectDB();
  const { Expenses } = getModels();
  await Expenses.findByIdAndDelete(id);
}
