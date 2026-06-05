"use client";

import { usePathname } from "next/navigation";

const titles: Record<string, string> = {
  "/": "Dashboard",
  "/flights": "Next 7 days Flights",
  "/tickets": "Tickets List",
  "/tickets/new": "Add Ticket",
  "/refund": "Refunds",
  "/seller": "Suppliers Transfers",
  "/seller/transfer": "Transfer Amount to Supplier",
  "/buyer": "Agents Transfers",
  "/buyer/transfer": "Transfer Amount to Agents",
  "/expenses": "Expenses",
  "/expenses/new": "Add Expense",
  "/upload": "Upload Files",
  "/users": "Agents List",
  "/users/new": "Add Agent",
};

export function PageContainer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/login") return <>{children}</>;

  let title = titles[pathname] || "Ticket Manager";
  if (pathname.includes("/edit")) {
    title = pathname.includes("/tickets") ? "Edit Ticket" : pathname.includes("/expenses") ? "Edit Expense" : "Edit Agent";
  }

  return (
    <div className="min-h-screen lg:pl-64">
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-6 lg:px-8">
          <h1 className="text-xl font-semibold lg:ml-0 ml-12">{title}</h1>
        </div>
      </header>
      <main className="p-6 lg:p-8">{children}</main>
    </div>
  );
}
