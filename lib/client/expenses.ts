import { api } from "@/lib/client/fetch";
import { formatDate } from "@/lib/utils/dates";
import { EXPENSE_CATEGORIES } from "@/lib/domain/expenses/categories";

const baseUrl = "/api/expenses";

export { EXPENSE_CATEGORIES };

export const expensesClient = {
  async getAll(filters: { start: string; end: string; type: string }) {
    const response = await api.post<Record<string, unknown>[]>(baseUrl, filters);
    return response.map((t, i) => {
      const categoryName = EXPENSE_CATEGORIES.filter(
        (cat) => cat.key === parseInt(String(t.category))
      );
      return {
        ...t,
        idP: i + 1,
        amount: "€ " + parseFloat(String(t.amount)),
        paymentDate: formatDate(String(t.paymentDate), "IT"),
        category: categoryName.length ? categoryName[0].text : "-",
      };
    });
  },
  async create(expense: Record<string, unknown>) {
    return api.post(`${baseUrl}/create`, expense);
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
};
