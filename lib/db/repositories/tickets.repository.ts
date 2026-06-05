import { connectDB } from "@/lib/db/connection";
import { getModels } from "@/lib/db/models";
import { formatDate } from "@/lib/utils/dates";

export interface DateFilter {
  start: string;
  end: string;
  type: string;
  refund?: boolean;
}

export async function getAllTickets(filters: DateFilter) {
  await connectDB();
  const { Tickets } = getModels();
  let filter: Record<string, unknown> =
    filters.type === "receivingAllDates"
      ? {
          $or: [
            { receivingAmount1Date: { $gte: filters.start, $lte: filters.end } },
            { receivingAmount2Date: { $gte: filters.start, $lte: filters.end } },
            { receivingAmount3Date: { $gte: filters.start, $lte: filters.end } },
          ],
        }
      : { [filters.type]: { $gte: filters.start, $lte: filters.end } };

  if (filters?.refund) {
    filter = {
      ...filter,
      $and: [{ refund: { $ne: null } }, { refund: { $ne: "" } }],
    };
  }
  return Tickets.find(filter).sort({ bookedOn: -1 });
}

export async function getTicketById(id: string) {
  await connectDB();
  const { Tickets } = getModels();
  return Tickets.findById(id);
}

export async function createTicket(params: Record<string, unknown>) {
  await connectDB();
  const { Tickets } = getModels();
  if (!(await Tickets.findOne({ ticketNumber: params.ticketNumber }))) {
    const ticket = new Tickets(params);
    await ticket.save();
  }
}

export async function updateTicket(id: string, params: Record<string, unknown>) {
  await connectDB();
  const { Tickets } = getModels();
  await Tickets.findByIdAndUpdate(id, params);
}

export async function findAndUpdateTicket(params: Record<string, unknown>) {
  await connectDB();
  const { Tickets } = getModels();
  const ticket = await Tickets.findOne({ ticketNumber: params.ticketNumber });
  if (ticket) {
    await updateTicket(ticket.id, { ...params });
  }
}

export async function deleteTicket(id: string) {
  await connectDB();
  const { Tickets } = getModels();
  await Tickets.findByIdAndDelete(id);
}

export async function getProfitTickets(filters: DateFilter) {
  await connectDB();
  const { Tickets } = getModels();
  const filter: Record<string, unknown> =
    filters.type === "receivingAllDates"
      ? {
          $or: [
            { receivingAmount1Date: { $gte: filters.start, $lte: filters.end } },
            { receivingAmount2Date: { $gte: filters.start, $lte: filters.end } },
            { receivingAmount3Date: { $gte: filters.start, $lte: filters.end } },
          ],
        }
      : { [filters.type]: { $gte: filters.start, $lte: filters.end } };
  return Tickets.find(filter).sort({ bookedOn: 1 });
}

export async function getBookings() {
  await connectDB();
  const { Tickets } = getModels();
  const currentDate = new Date();
  const endDate = formatDate(currentDate);
  const startDate = formatDate(
    new Date(currentDate.getFullYear() - 2, currentDate.getMonth(), 1)
  );
  return Tickets.find({ bookedOn: { $gte: startDate, $lte: endDate } })
    .select(["bookedOn", "dates"])
    .sort({ bookedOn: -1 });
}

function formatDMY(d: Date): string {
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export async function getFlightsTickets() {
  await connectDB();
  const { Tickets } = getModels();
  const today = new Date();
  const dates = Array.from({ length: 8 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return formatDMY(d);
  });
  const regex = `(${dates.join("|")})`;
  return Tickets.find({ dates: { $regex: regex } }).sort({ bookedOn: -1 });
}

export async function getTicketsByAgent() {
  await connectDB();
  const { Tickets } = getModels();
  const filter = {
    $and: [
      { bookedOn: { $gt: "2024-01-01" } },
      {
        $expr: {
          $gt: [
            { $ifNull: [{ $convert: { input: "$agentCost", to: "double", onError: 0, onNull: 0 } }, 0] },
            { $ifNull: [{ $convert: { input: "$paidByAgent", to: "double", onError: 0, onNull: 0 } }, 0] },
          ],
        },
      },
    ],
  };
  return Tickets.find(filter).sort({ bookedOn: -1 });
}

export async function getTicketsForSupply(filters: Record<string, unknown> = {}) {
  await connectDB();
  const { Tickets } = getModels();
  const filter = {
    ...filters,
    $and: [{ iata: { $eq: "SCA" } }],
    $expr: { $gt: [{ $toDouble: "$paidAmount" }, { $toDouble: "$supplied" }] },
  };
  return Tickets.find(filter).sort({ bookedOn: -1 });
}

export async function getRefundsForSupply(filters: Record<string, unknown> = {}) {
  await connectDB();
  const { Tickets } = getModels();
  const filter = {
    ...filters,
    $and: [
      { refund: { $ne: null } },
      { refund: { $ne: "" } },
      { iata: { $eq: "SCA" } },
    ],
    $expr: { $gt: [{ $toDouble: "$refund" }, { $toDouble: "$refundUsed" }] },
  };
  return Tickets.find(filter).sort({ bookedOn: -1 });
}
