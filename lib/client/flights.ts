import { api } from "@/lib/client/fetch";
import moment from "moment";
import { cleanFlight } from "@/lib/utils/dates";

const baseUrl = "/api/flights";
const ticketsUrl = "/api/tickets";

export const flightsService = {
  async getAll() {
    return api.get(baseUrl);
  },
  async create(flight: Record<string, unknown>) {
    return api.post(`${baseUrl}/create`, flight);
  },
  async update(id: string, params: Record<string, unknown>) {
    return api.put(`${baseUrl}/${id}`, params);
  },
  async delete(id: string) {
    return api.delete(`${baseUrl}/${id}`);
  },
  async getById(id: string) {
    return api.get(`${baseUrl}/${id}`);
  },
  async setFlights() {
    const airlines = (await api.get<{ name: string }[]>(baseUrl)) || [];
    const airlinesI = airlines.map((al) => al.name) || [];
    const airlinesN: string[] = [];
    const airlinesT: string[] = [];
    const filters = {
      start: moment().add("-24", "month").format("YYYY-MM-DD"),
      end: moment().format("YYYY-MM-DD"),
      type: "bookedOn",
    };
    const tickets = await api.post<Record<string, unknown>[]>(ticketsUrl, filters);
    tickets.forEach((t) => {
      const flight = cleanFlight(t as { flight?: string });
      if (!airlinesT.includes(flight)) airlinesT.push(flight);
    });
    airlinesT.forEach((at) => {
      if (at.trim() && !airlinesI.includes(at)) airlinesN.push(at);
    });
    return airlinesN;
  },
};
