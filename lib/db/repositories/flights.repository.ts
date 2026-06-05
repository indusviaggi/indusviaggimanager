import { connectDB } from "@/lib/db/connection";
import { getModels } from "@/lib/db/models";

export async function getAllAirlines() {
  await connectDB();
  const { Airlines } = getModels();
  return Airlines.find();
}

export async function getAirlineById(id: string) {
  await connectDB();
  const { Airlines } = getModels();
  return Airlines.findById(id);
}

export async function createAirline(params: Record<string, unknown>) {
  await connectDB();
  const { Airlines } = getModels();
  const flight = new Airlines(params);
  await flight.save();
}

export async function updateAirline(id: string, params: Record<string, unknown>) {
  await connectDB();
  const { Airlines } = getModels();
  await Airlines.findByIdAndUpdate(id, params);
}

export async function deleteAirline(id: string) {
  await connectDB();
  const { Airlines } = getModels();
  await Airlines.findByIdAndDelete(id);
}
