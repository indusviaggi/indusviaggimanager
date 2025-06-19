import { apiHandler, ticketsRepo } from "helpers/api";

export default apiHandler({
  post: getProfit,
});

async function getProfit(req, res) {
  const tickets = await ticketsRepo.getProfit(req.body);
  return res.status(200).json(tickets);
}
