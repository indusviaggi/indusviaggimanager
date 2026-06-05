export function formatDate(
  date: Date | string,
  format: "DB" | "IT" = "DB"
): string {
  let d: Date;
  if (date instanceof Date) {
    d = date;
  } else if (typeof date === "string" && date.includes("/")) {
    const parts = date.split("/");
    if (parts.length === 3) {
      d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    } else {
      d = new Date(date);
    }
  } else {
    d = new Date(date);
  }

  if (isNaN(d.getTime())) {
    d = new Date();
  }

  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const year = d.getFullYear();

  return format === "DB"
    ? `${year}-${month}-${day}`
    : `${day}/${month}/${year}`;
}

export function cleanFlight(ticket: { flight?: string }): string {
  let flight = (ticket?.flight || "")
    .trim()
    .replace("A-", "")
    .trim()
    .replace("-", "")
    .trim();
  const flight2 = flight.slice(0, 2);
  return flight2 === "A " ? flight.slice(2).trim() : flight;
}
