import { useState, useEffect } from "react";
import getConfig from "next/config";
import { userService } from "services";
import Link from "next/link";

export { Nav };

function Nav() {
  const [user, setUser] = useState(null);
  const pages = [
    "users",
    "tickets",
    "upload",
    "refund",
    "seller",
    "buyer",
    "expenses",
    "flights",
  ];
  const titles = {
    users: "Agents List",
    tickets: "Tickets List",
    upload: "Upload Files",
    "tickets/add": "Add Ticket",
    "tickets/edit": "Edit Ticket",
    refund: "Refunds",
    seller: "Suppliers Transfers",
    buyer: "Agents Transfers",
    "buyer/transfer": "Transfer Amount to Agents",
    "seller/transfer": "Transfer Amount to Supplier",
    expenses: "Expenses",
    "expenses/categories": "Expenses Categories",
    "expenses/add": "Add Expense",
    "expenses/edit": "Edit Expense",
    flights: "Next Flights/Events",
  };
  const config = getConfig();
  let icon = "fa fa-plane yellow";
  if (config?.publicRuntimeConfig?.isLocal) {
    icon = "fa fa-plane green";
  }

  useEffect(() => {
    const subscription = userService.user.subscribe((x) => setUser(x));
    return () => subscription.unsubscribe();
  }, []);

  function openClose(e) {
    e.preventDefault();
    document.querySelector("#wrapper").classList.toggle("toggled");
  }

  // only show nav when logged in
  if (!user) return null;

  function getPage() {
    let page = window?.location?.pathname || "";
    let parts = page.split("/");
    page = parts.length > 3 ? "/" + parts[1] + "/" + parts[2] : page;
    page = page.replace("/", "");
    return titles[page] || "Dashboard - " + userService.userValue?.firstName;
  }

  function getActiveMenu(curPage = null) {
    if (curPage) {
      return window?.location?.href.includes(curPage)
        ? "nav-item active"
        : "nav-item";
    }
    return pages.every((p) => !window.location.href.includes(p))
      ? "nav-item active"
      : "nav-item";
  }

  return (
    <div>
      <aside id="sidebar-wrapper">
        <div className="sidebar-brand">
          <h2>
            <i className={icon}></i>
            &nbsp;&nbsp;Ticket Manager
          </h2>
        </div>

        <ul className="sidebar-nav">
          <li className={getActiveMenu()}>
            <Link href="/">
              <i className="fa-fw fas fa-line-chart nav-icon"></i>
              &nbsp;&nbsp;&nbsp;&nbsp; Dashboard
            </Link>
          </li>
          <li className={getActiveMenu("flights")}>
            <Link href="/flights">
              <i className="fa-fw fas fa-plane nav-icon"></i>
              &nbsp;&nbsp;&nbsp;&nbsp; Next Flights/Events
            </Link>
          </li>
          <li className={getActiveMenu("tickets")}>
            <Link href="/tickets">
              <i className="fa-fw fas fa-list nav-icon"></i>
              &nbsp;&nbsp;&nbsp;&nbsp; Tickets
            </Link>
          </li>
          <li className={getActiveMenu("refund")}>
            <Link href="/refund">
              <i className="fa-fw fas fa-wallet nav-icon"></i>
              &nbsp;&nbsp;&nbsp;&nbsp; Refunds
            </Link>
          </li>
          <li className={getActiveMenu("seller")}>
            <Link href="/seller">
              <i className="fa-fw fas fa-money-check-dollar nav-icon"></i>
              &nbsp;&nbsp;&nbsp;&nbsp; Suppliers Transfers
            </Link>
          </li>
          <li className={getActiveMenu("buyer")}>
            <Link href="/buyer">
              <i className="fa-fw fas fa-money-bill-transfer nav-icon"></i>
              &nbsp;&nbsp;&nbsp;&nbsp; Agents Transfers
            </Link>
          </li>
          <li className={getActiveMenu("expenses")}>
            <Link href="/expenses">
              <i className="fa-fw fas fa-money-bill nav-icon"></i>
              &nbsp;&nbsp;&nbsp;&nbsp; Expenses
            </Link>
          </li>
          <li className={getActiveMenu("upload")}>
            <Link href="/upload">
              <i className="fa-fw fas fa-upload nav-icon"></i>
              &nbsp;&nbsp;&nbsp;&nbsp; Uploads
            </Link>
          </li>
          <li className={getActiveMenu("users")}>
            <Link href="/users">
              <i className="fa-fw fas fa-users nav-icon"></i>
              &nbsp;&nbsp;&nbsp;&nbsp; Agents
            </Link>
          </li>
          <li className="nav-item">
            <Link onClick={userService.logout} href="#">
              <i className="nav-icon fas fa-fw fa-sign-out-alt"></i>
              &nbsp;&nbsp;&nbsp;&nbsp; Logout
            </Link>
          </li>
        </ul>
      </aside>
      <div id="navbar-wrapper">
        <nav className="navbar navbar-inverse">
          <div className="container-fluid">
            <div className="navbar-header">
              <a
                onClick={(e) => {
                  openClose(e);
                }}
                href="#"
                className="navbar-brand"
                id="sidebar-toggle"
              >
                <i className="fa fa-bars"></i>
              </a>
            </div>
            <div style={{ margin: "auto" }}>{getPage()}</div>
          </div>
        </nav>
      </div>
    </div>
  );
}
