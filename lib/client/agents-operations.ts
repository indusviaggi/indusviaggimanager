import { api } from "@/lib/client/fetch";
import { formatDate } from "@/lib/utils/dates";

const baseUrl = "/api/agentsoperations";
const ticketsUrl = "/api/tickets";

export const agentsOperationsService = {
  async getAll(filters: {
    start: string;
    end: string;
    type: string;
    agent?: string | null;
  }) {
    const response = await api.post<Record<string, unknown>[]>(baseUrl, filters);
    const filtersT = { ...filters, type: "bookedOn" };
    const ticketsT = await api.post<Record<string, unknown>[]>(ticketsUrl, filtersT);

    const tickets: Record<string, unknown>[] = [];
    const ticketsIds: string[] = [];
    ticketsT.forEach((t) => {
      if (
        (filters.agent === null && String(t.agentCost).trim() !== "0") ||
        filters.agent === t.agentId
      ) {
        ticketsIds.push(String(t.id));
        tickets.push(t);
      }
    });

    const data = response.map((e) => {
      const ticketArr = e?.ticket as Record<string, unknown>[] | undefined;
      const ticket = (ticketArr?.[0] || {}) as Record<string, string>;
      const agentArr = e?.agent as Record<string, string>[] | undefined;
      const agent = agentArr?.[0];
      const paidAmount = parseFloat(ticket.agentCost || "0");
      const supplied = parseFloat(ticket.paidByAgent || "0");
      const remainedSupplied =
        parseFloat(ticket.agentCost || "0") - parseFloat(ticket.paidByAgent || "0");

      if (
        !ticketsIds.includes(String(ticket?._id)) &&
        (filters.agent === null || filters.agent === ticket.agentId)
      ) {
        ticketsIds.push(String(ticket._id));
        tickets.push(ticket);
      }
      return {
        ...e,
        cid: e._id,
        transferDate: formatDate(String(e.transferDate), "IT"),
        balanceOperation: e.balanceOperation ? "€ " + e.balanceOperation : "-",
        balanceOperationN: e.balanceOperation,
        balanceOperationDelta: e.balanceOperationDelta
          ? "€ " + e.balanceOperationDelta
          : "-",
        balanceOperationDeltaN: e.balanceOperationDelta,
        remainedSupplied: "€ " + remainedSupplied.toFixed(2),
        paidAmount: "€ " + paidAmount.toFixed(2),
        supplied: "€ " + supplied.toFixed(2),
        name: ticket.name,
        agentName: agent ? agent.firstName + " " + agent.lastName : "Not Found",
        bookingCode: ticket.bookingCode,
        totalOperation: e.totalOperation ? "€ " + e.totalOperation : "",
        transferOperation: "€ " + e.transferOperation,
        transferOperationN: e.transferOperation,
        suppliedTicket: "€ " + e.suppliedTicket,
        suppliedTicketN: e.suppliedTicket,
        suppliedTotal: "€ " + parseFloat(String(e.suppliedTotal)).toFixed(2),
        suppliedTotalN: parseFloat(String(e.suppliedTotal)).toFixed(2),
      };
    });
    return { data, tickets };
  },
  async create(operation: Record<string, unknown>) {
    return api.post(`${baseUrl}/create`, operation);
  },
  async delete(id: string) {
    return api.delete(`${baseUrl}/${id}`);
  },
};
