import { connectDB } from "@/lib/db/connection";
import { getModels } from "@/lib/db/models";
import type { DateFilter } from "./tickets.repository";

export async function getAllOperations(filters: DateFilter) {
  await connectDB();
  const { Operations } = getModels();
  const query = [
    {
      $match: {
        $and: [
          { [filters.type]: { $gte: filters.start, $lte: filters.end } },
        ],
      },
    },
    {
      $lookup: {
        from: "tickets",
        localField: "ticketId",
        foreignField: "_id",
        as: "ticket",
      },
    },
  ];
  return Operations.aggregate(query).sort({ operation: 1 });
}

export async function createOperation(params: Record<string, unknown>) {
  await connectDB();
  const { Operations } = getModels();
  const operation = new Operations(params);
  await operation.save();
}

export async function deleteOperation(id: string) {
  await connectDB();
  const { Operations } = getModels();
  await Operations.findByIdAndDelete(id);
}
