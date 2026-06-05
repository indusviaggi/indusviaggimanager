import { connectDB } from "@/lib/db/connection";
import { getModels } from "@/lib/db/models";
import type { DateFilter } from "./tickets.repository";

export async function getAllAgentsOperations(filters: DateFilter) {
  await connectDB();
  const { AgentsOperations } = getModels();
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
    {
      $lookup: {
        from: "users",
        localField: "agentId",
        foreignField: "_id",
        as: "agent",
        pipeline: [{ $project: { firstName: 1, lastName: 1, id: 1, _id: 1 } }],
      },
    },
  ];
  return AgentsOperations.aggregate(query).sort({ operation: 1 });
}

export async function createAgentsOperation(params: Record<string, unknown>) {
  await connectDB();
  const { AgentsOperations } = getModels();
  const operation = new AgentsOperations(params);
  await operation.save();
}

export async function deleteAgentsOperation(id: string) {
  await connectDB();
  const { AgentsOperations } = getModels();
  await AgentsOperations.findByIdAndDelete(id);
}
