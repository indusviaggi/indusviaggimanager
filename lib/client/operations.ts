import { api } from "@/lib/client/fetch";
import { formatDate } from "@/lib/utils/dates";

const baseUrl = "/api/operations";

export const operationsService = {
  async getAll(filters: { start: string; end: string; type: string }) {
    const response = await api.post<Record<string, unknown>[]>(baseUrl, filters);
    return response.map((e) => {
      const ticketArr = e?.ticket as Record<string, unknown>[] | undefined;
      const ticket = (ticketArr?.[0] || {}) as Record<string, string>;
      const paidAmount = parseFloat(ticket.paidAmount || "0");
      const supplied = parseFloat(ticket.supplied || "0");
      const refundUsed = parseFloat(ticket.refundUsed || "0");
      const refund = parseFloat(ticket.refund || "0");
      const remainedRefund =
        parseFloat(ticket.refund || "0") - parseFloat(ticket.refundUsed || "0");
      const remainedSupplied =
        parseFloat(ticket.paidAmount || "0") - parseFloat(ticket.supplied || "0");
      return {
        ...e,
        cid: e._id,
        transferDate: formatDate(String(e.transferDate), "IT"),
        suppliedTicketN: e.suppliedTicket,
        suppliedTicket: e.suppliedTicket ? "€ " + e.suppliedTicket : "-",
        ticketRefundUsedN: e.ticketRefundUsed,
        ticketRefundUsed: e.ticketRefundUsed ? "€ " + e.ticketRefundUsed : "-",
        remainedRefund: ticket.refund ? "€ " + remainedRefund.toFixed(2) : "-",
        remainedSupplied: "€ " + remainedSupplied.toFixed(2),
        paidAmount: "€ " + paidAmount.toFixed(2),
        supplied: "€ " + supplied.toFixed(2),
        refund: "€ " + refund.toFixed(2),
        refundUsed: "€ " + refundUsed.toFixed(2),
        name: ticket.name,
        bookingCode: ticket.bookingCode,
        totalOperation: e.totalOperation ? "€ " + e.totalOperation : "",
        transferAmountTotalOperation: "€ " + e.transferAmountTotalOperation,
        refundAmountTotalOperation: "€ " + e.refundAmountTotalOperation,
        transferAmountTotalOperationN: e.transferAmountTotalOperation,
        refundAmountTotalOperationN: e.refundAmountTotalOperation,
      };
    });
  },
  async create(operation: Record<string, unknown>) {
    return api.post(`${baseUrl}/create`, operation);
  },
  async delete(id: string) {
    return api.delete(`${baseUrl}/${id}`);
  },
};
