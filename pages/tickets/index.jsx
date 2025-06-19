import { Layout } from "components/users";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ColumnGroup } from "primereact/columngroup";
import { Row } from "primereact/row";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { FilterMatchMode } from "primereact/api";
import React, { useState, useEffect, useRef } from "react";
import Router from "next/router";
import { Dialog } from "primereact/dialog";
import { formatDate, ticketsService } from "../../services";
import { jsPDF } from "jspdf";

export default Index;

function Index() {
  const [tickets, setTickets] = useState([]);
  const [apiTickets, setApiTickets] = useState([]);
  const dt = useRef(null);
  const [ticketDialog, setTicketDialog] = useState(false);
  const [deleteTicketDialog, setDeleteTicketDialog] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dates, setDates] = useState({ start: "", end: "", type: "" });
  const [totals, setTotals] = useState([0, 0, 0, 0]);

  useEffect(() => {
    getTickets();
  }, []);

  const getTickets = (dates = null) => {
    setLoading(true);
    let start = new Date();
    //start.setMonth(start.getMonth() - 6);
    start.setDate(1);
    start = formatDate(start);
    let end = formatDate(new Date());
    let type = "bookedOn";
    if (dates) {
      start = dates.start;
      end = dates.end;
      type = dates.type;
    } else {
      setDates({ start, end, type });
    }
    ticketsService.getAll({ start, end, type }).then((tickets) => {
      setTickets(tickets);
      setApiTickets(tickets);
      onGlobalFilterChange({ target: { value: "" } });
      setLoading(false);
    });
  };

  const search = () => {
    let start = document.getElementById("start").value;
    let end = document.getElementById("end").value;
    let type = document.getElementById("type").value;
    getTickets({ start, end, type });
  };

  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const allFilters = [
    "name",
    "agent",
    "bookingCode",
    "cardNumber",
    "ticketNumber",
    "methods",
    "paidAmount",
    "receivingAmountT",
    "profit",
    "bookedOn",
    "phone",
    "iata",
    "flight",
    "travel1",
    "travel2",
  ];
  const [filtersA, setFiltersA] = useState(allFilters);
  const [globalFilterValue, setGlobalFilterValue] = useState("");

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };

    _filters["global"].value = value;

    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const addNew = () => {
    Router.push("/tickets/add");
  };

  const applyFilters = (e) => {
    let types = [
      "all",
      "agent",
      "bookingCode",
      "ticketNumber",
      "iata",
      "name",
      "cardNumber",
      "methods",
      "travel1",
      "travel2",
    ];
    let selected = parseInt(e.target.value);
    if (selected !== 0) {
      setFiltersA([types[selected]]);
    } else {
      setFiltersA(allFilters);
    }
  };

  const filterProfitType = (e) => {
    const isChecked = e.target.checked;
    let totals = apiTickets;
    if (isChecked) {
      let newTickets = tickets.filter((t) => !t.amountsCompleted);
      newTickets = newTickets.length > 0 ? newTickets : [];
      setTickets([...newTickets]);
      totals = newTickets;
    } else {
      setTickets([...apiTickets]);
    }
    calculate(totals);
  };

  const renderHeader = () => {
    return (
      <div className="flex justify-content-end">
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Keyword Search"
          />
        </span>
        <select
          className="form-select"
          aria-label="filters"
          onChange={(e) => {
            applyFilters(e);
          }}
        >
          <option defaultValue value="0">
            All
          </option>
          <option value="1">Agent Name</option>
          <option value="2">PNR</option>
          <option value="3">Ticket Number</option>
          <option value="4">Issued By</option>
          <option value="5">Passenger Name</option>
          <option value="6">Card Number</option>
          <option value="7">Payment Methods</option>
        </select>
        <input
          className="ms-2"
          type="checkbox"
          id="profitType"
          onChange={(e) => filterProfitType(e)}
        />
        &nbsp;Not Fully Paid
        <Button
          className="tb-btns"
          type="button"
          icon="fa fa-file-excel"
          rounded
          onClick={() => exportCSV(false)}
          data-pr-tooltip="CSV"
          severity="success"
        />
        <Button
          className="tb-btns"
          type="button"
          icon="fa fa-plus"
          rounded
          onClick={() => addNew()}
          data-pr-tooltip="CSV"
          severity="primary"
        />
      </div>
    );
  };

  const header = renderHeader();

  const exportCSV = (selectionOnly) => {
    dt.current.exportCSV({ selectionOnly });
  };

  const infoTicket = (ticket) => {
    setTicket(ticket);
    setTicketDialog(true);
  };

  const editTicket = (ticket) => {
    window.open("/tickets/edit/" + ticket.id, "_blank");
  };

  const actions = (e, ticket) => {
    switch (parseInt(e?.value?.code)) {
      case 1:
        infoTicket(ticket);
        break;
      case 2:
        downloadTicket(ticket);
        break;
      case 3:
        editTicket(ticket);
        break;
      case 4:
        confirmDeleteTicket(ticket);
        break;
      default:
        infoTicket(ticket);
        break;
    }
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <>
        <Dropdown
          onChange={(e) => actions(e, rowData)}
          options={[
            { name: "Info", code: "1" },
            { name: "PDF", code: "2" },
            { name: "Edit", code: "3" },
            { name: "Delete", code: "4" },
          ]}
          optionLabel="name"
          placeholder="Actions"
        />
      </>
    );
  };

  const confirmDeleteTicket = (ticket) => {
    setTicket(ticket);
    setDeleteTicketDialog(true);
  };

  const downloadTicket = (ticket) => {
    const imgData = "logo.png";
    const doc = new jsPDF();
    let row = 10;
    let width = 130;
    let length = 35;
    doc.addImage(imgData, "PNG", 10, 10, 40, 40);

    doc.setFontSize(20);
    row += 10;
    doc.text("Indus Viaggi", 200, row, null, null, "right");
    doc.setFontSize(10);
    row += 10;
    doc.text("Via Don Giovanni Alai, 6/A", 200, row, null, null, "right");
    row += 5;
    doc.text("42121 - Reggio Emilia", 200, row, null, null, "right");
    row += 5;
    doc.text("Tel/fax: +39 0522434627", 200, row, null, null, "right");
    row += 5;
    doc.text(
      "Cell.: +39 3889220982, +39 3802126100",
      200,
      row,
      null,
      null,
      "right"
    );
    row += 10;
    doc.setDrawColor(120, 120, 120);
    doc.line(10, row, 200, row);
    doc.setFontSize(14);
    row += 20;

    doc.text("Nome Passeggero", 10, row);
    doc.text(":", 60, row);
    doc.text(ticket.name, 65, row, { maxWidth: width }, null, "left");
    ticket.name.length > length ? (row += 10) : (row += 4);

    doc.line(10, row, 200, row);
    row += 7;

    doc.text("Data Acquisto", 10, row);
    doc.text(":", 60, row);
    doc.text(ticket.bookedOn, 65, row, { maxWidth: width }, null, "left");
    ticket.bookedOn.length > length ? (row += 10) : (row += 4);
    doc.line(10, row, 200, row);
    row += 7;

    doc.text("Codice prenotazione", 10, row);
    doc.text(":", 60, row);
    doc.text(ticket.bookingCode, 65, row, { maxWidth: width }, null, "left");
    ticket.bookingCode.length > length ? (row += 10) : (row += 4);
    doc.line(10, row, 200, row);
    row += 7;

    doc.text("Date Viaggio", 10, row);
    doc.text(":", 60, row);
    doc.text(ticket.dates, 65, row, { maxWidth: width }, null, "left");
    ticket.dates.length > length ? (row += 10) : (row += 4);
    doc.line(10, row, 200, row);
    row += 7;

    doc.text("Porto di partenza", 10, row);
    doc.text(":", 60, row);
    doc.text(ticket.travel1, 65, row, { maxWidth: width }, null, "left");
    ticket.travel1.length > length ? (row += 10) : (row += 4);
    doc.line(10, row, 200, row);
    row += 7;

    doc.text("Porto di arrivo", 10, row);
    doc.text(":", 60, row);
    doc.text(ticket.travel2, 65, row, { maxWidth: width }, null, "left");
    ticket.travel2.length > length ? (row += 10) : (row += 4);
    doc.line(10, row, 200, row);
    row += 7;

    doc.text("Numero del biglietto", 10, row);
    doc.text(":", 60, row);
    doc.text(ticket.ticketNumber, 65, row, { maxWidth: width }, null, "left");
    ticket.ticketNumber.length > length ? (row += 10) : (row += 4);
    doc.line(10, row, 200, row);
    row += 7;

    doc.text("Pagato", 10, row);
    doc.text(":", 60, row);
    let total =
      parseFloat(
        (parseFloat(ticket.receivingAmount1) || 0) +
          (parseFloat(ticket.receivingAmount2) || 0) +
          (parseFloat(ticket.receivingAmount3) || 0)
      ).toFixed(2) + " EUR";
    doc.text(total, 65, row, { maxWidth: width }, null, "left");
    total.length > length ? (row += 10) : (row += 4);
    doc.line(10, row, 200, row);
    row += 7;

    doc.text("Metodo di pagamento", 10, row);
    doc.text(":", 60, row);
    let methods =
      ticket.paymentMethod +
      (ticket.receivingAmount2Method
        ? " - " + ticket.receivingAmount2Method
        : "") +
      (ticket.receivingAmount3Method
        ? " - " + ticket.receivingAmount3Method
        : "");
    doc.text(methods, 65, row, { maxWidth: width }, null, "left");
    methods.length > length ? (row += 10) : (row += 4);
    doc.line(10, row, 200, row);
    row += 7;

    doc.text("Volo/Nave", 10, row);
    doc.text(":", 60, row);
    doc.text(ticket.flight, 65, row, { maxWidth: width }, null, "left");
    ticket.flight.length > length ? (row += 10) : (row += 4);
    doc.line(10, row, 200, row);
    row += 7;

    doc.text("Numero di telefono", 10, row);
    doc.text(":", 60, row);
    doc.text(ticket.phone, 65, row, { maxWidth: width }, null, "left");
    ticket.phone.length > length ? (row += 10) : (row += 4);
    doc.line(10, row, 200, row);
    row += 7;

    if (ticket.refund) {
      doc.text("Rimborso", 10, row);
      doc.text(":", 60, row);
      let refund =
        ticket.refund +
        " EUR" +
        (ticket.refundDate ? " - " + formatDate(ticket.refundDate, "IT") : "");
      doc.text(refund, 65, row, { maxWidth: width }, null, "left");
      refund.length > length ? (row += 10) : (row += 4);
      doc.line(10, row, 200, row);
      row += 7;
    }

    /*const generateData = function () {
      return [
        {
          A: "Nome",
          B: ticket.name || "-",
        },
        {
          A: "Data",
          B: ticket.bookedOn || "-",
        },
        {
          A: "Codice prenotazione",
          B: ticket.bookingCode || "-",
        },
        { A: "Date del Viaggio", B: ticket.dates },
        {
          A: "Porto di partenza",
          B: ticket.travel1 || "-",
        },
        {
          A: "Porto di arrivo",
          B: ticket.travel2 || "-",
        },
        {
          A: "Numero del biglietto",
          B: ticket.ticketNumber || "-",
        },
        {
          A: "Pagato",
          B: ticket.receivingAmount1
            ? parseFloat(
                parseFloat(ticket.receivingAmount1) +
                  parseFloat(ticket.receivingAmount2) +
                  parseFloat(ticket.receivingAmount3)
              ).toFixed(2) + " EUR"
            : "-",
        },
        {
          A: "Metodo di pagamento",
          B: ticket.paymentMethod || "-",
        },
        {
          A: "Volo",
          B: ticket.flight || "-",
        },
        {
          A: "Numero di telefono",
          B: ticket.phone || "-",
        },
      ];
    };

    function createHeaders(keys) {
      let result = [];
      for (let i = 0; i < keys.length; i += 1) {
        result.push({
          id: keys[i],
          name: keys[i],
          prompt: keys[i],
          width: keys[i] === "A" ? 70 : 170,
          align: "center",
          padding: 0,
        });
      }
      return result;
      //return keys;
    }

    doc.table(10, row, generateData(), createHeaders(["A", "B"]), {
      autoSize: false,
    });*/
    row = 280;
    doc.setFontSize(8);
    doc.text("Indus Viaggi", 200, row, null, null, "right");
    row += 2;
    doc.line(10, row, 200, row);
    row += 3;
    doc.text(
      "Via Don Giovanni Alai, 6/A, 42121 Reggio Emilia RE",
      200,
      row,
      null,
      null,
      "right"
    );
    doc.save(ticket.name.replace(/\W/g, "_") + "_" + ticket.id + ".pdf");
  };

  const hideDeleteTicketDialog = () => {
    setDeleteTicketDialog(false);
  };

  const deleteTicket = () => {
    //console.log("delete", ticket);
    ticketsService.delete(ticket.id).then(() => {
      setTickets((tickets) => tickets.filter((x) => x.id !== ticket.id));
      setApiTickets((tickets) => tickets.filter((x) => x.id !== ticket.id));
      hideDeleteTicketDialog();
    });
  };

  const deleteTicketDialogFooter = (
    <div>
      <Button
        label="No"
        icon="fa fa-times"
        className="p-button-text"
        onClick={hideDeleteTicketDialog}
      />
      <Button
        label="Yes"
        icon="fa fa-check"
        className="p-button-text"
        onClick={deleteTicket}
      />
    </div>
  );
  const footerGroup = (
    <ColumnGroup>
      <Row>
        <Column
          footer="Totals:"
          colSpan={6}
          footerStyle={{ textAlign: "right" }}
        />
        <Column footer={totals[0]} />
        <Column footer={totals[1]} />
        <Column footer={totals[2]} />
        <Column />
        <Column />
        <Column />
        <Column footer={totals[3]} />
      </Row>
    </ColumnGroup>
  );

  const calculate = (data) => {
    //console.log(data);
    let tp = 0;
    let tc = 0;
    let tr = 0;
    let ta = 0;
    for (let i = 0; i < data.length; i++) {
      let ttp = data[i].profit.replace("€ ", "");
      let ttc = data[i].paidAmount.replace("€ ", "");
      let ttr = data[i].receivingAmountT.replace("€ ", "");
      let tta = data[i].agentCost ? data[i].agentCost.replace("€ ", "") : 0;
      tp += parseFloat(ttp);
      tc += parseFloat(ttc);
      tr += parseFloat(ttr);
      ta += parseFloat(tta);
    }

    setTotals([
      "€ " + tp.toFixed(2),
      "€ " + tc.toFixed(2),
      "€ " + tr.toFixed(2),
      "€ " + ta.toFixed(2),
    ]);
  };

  return (
    <Layout>
      <div className="container">
        <div className="row">
          <div className="col-sm-2">
            <label htmlFor="type">Type:</label>
            <div className="input-group">
              <select id="type" className="form-select">
                <option defaultValue value="bookedOn">
                  Issue Date
                </option>
                <option value="receivingAllDates">All Amounts Dates</option>
                <option value="receivingAmount1Date">Amount 1 Date</option>
                <option value="receivingAmount2Date">Amount 2 Date</option>
                <option value="receivingAmount3Date">Amount 3 Date</option>
              </select>
            </div>
          </div>
          <div className="col-sm-4">
            <label htmlFor="start">From Date:</label>
            <div className="input-group">
              <input
                type="date"
                className="form-control"
                id="start"
                defaultValue={dates.start}
                placeholder="From"
              />
            </div>
          </div>
          <div className="col-sm-4">
            <label htmlFor="end">To Date:</label>
            <div className="input-group">
              <input
                type="date"
                className="form-control"
                id="end"
                defaultValue={dates.end}
                placeholder="To"
              />
            </div>
          </div>
          <div className="col-sm-2">
            <button
              type="submit"
              className="btn btn-block btn-primary width-search"
              onClick={() => {
                search();
              }}
            >
              <i className="fa fa-search"></i> Search
            </button>
          </div>
        </div>
      </div>
      <br />
      <div className="card">
        <DataTable
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          rowsPerPageOptions={[25, 50, 100, 250, 500]}
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
          loading={loading}
          size="small"
          tableStyle={{ minWidth: "100rem" }}
          ref={dt}
          onValueChange={(filteredData) => {
            calculate(filteredData);
          }}
          value={tickets}
          paginator
          rows={25}
          dataKey="id"
          filters={filters}
          csvSeparator=";"
          globalFilterFields={filtersA}
          header={header}
          footerColumnGroup={footerGroup}
          emptyMessage="No tickets found."
        >
          <Column
            style={{ maxWidth: "6rem" }}
            header="Actions"
            body={actionBodyTemplate}
            exportable={false}
          ></Column>
          <Column
            style={{ width: "5rem", textAlign: "center" }}
            field="idP"
            header="Id"
          />
          <Column
            style={{ maxWidth: "8rem" }}
            field="name"
            sortable
            header="Passenger"
          />
          <Column hidden field="refund" sortable header="Refund" />
          <Column hidden field="refundDate" sortable header="Refund Date" />
          <Column hidden field="penality" sortable header="Penality" />
          <Column hidden field="returned" sortable header="Returned" />
          <Column hidden field="returnedDate" sortable header="Returned Date" />
          <Column hidden field="refundUsed" sortable header="Refund Used" />
          <Column field="bookingCode" sortable header="PNR" />
          <Column field="ticketNumber" sortable header="Ticket" />
          <Column field="iata" sortable header="Issued by" />
          <Column field="profit" sortable header="Profit" />
          <Column field="paidAmount" sortable header="Cost" />
          <Column field="receivingAmountT" sortable header="Tot. Received" />
          <Column field="methods" sortable header="Pay. Methods" />
          <Column field="bookedOn" sortable header="Issue Date" />
          <Column field="agent" sortable header="Agent" />
          <Column field="agentCost" sortable header="Ag. Cost" />
          <Column hidden field="phone" sortable header="Phone" />
          <Column hidden field="cardNumber" sortable header="Card Number" />
          <Column hidden field="flight" sortable header="Flight" />
          <Column hidden field="receivingAmount1" header="receivingAmount 1" />
          <Column
            hidden
            field="receivingAmount1Date"
            header="receiving Amount 1 Date"
          />
          <Column hidden field="receivingAmount2" header="receivingAmount 2" />
          <Column
            hidden
            field="receivingAmount2Date"
            header="receiving Amount 2 Date"
          />
          <Column
            hidden
            field="receivingAmount2Method"
            header="receiving Amount 2 Method"
          />
          <Column hidden field="receivingAmount3" header="receivingAmount 3" />
          <Column
            hidden
            field="receivingAmount3Date"
            header="receiving Amount 3 Date"
          />
          <Column
            hidden
            field="receivingAmount3Method"
            header="receiving Amount 3 Method"
          />
          <Column hidden field="travel1" header="travel 1" />
          <Column hidden field="travel2" header="travel 2" />
          <Column hidden field="dates" header="dates" />
        </DataTable>
      </div>
      <Dialog
        visible={deleteTicketDialog}
        header="Confirm"
        modal
        footer={deleteTicketDialogFooter}
        onHide={hideDeleteTicketDialog}
      >
        <div className="confirmation-content">
          <i className="fa fa-triangle mr-3" />
          {ticket && (
            <span>
              Are you sure you want to delete <b>{ticket.name}</b>&apos;s
              ticket?
            </span>
          )}
        </div>
      </Dialog>
      <Dialog
        visible={ticketDialog}
        style={{ width: "60%" }}
        header="Details"
        modal
        className="p-fluid"
        onHide={() => setTicketDialog(false)}
      >
        {ticket && (
          <table className="table">
            <tbody>
              <tr>
                <td scope="col">Passenger:</td>
                <td scope="col">{ticket.name}</td>
              </tr>
              <tr>
                <td scope="col">Agent:</td>
                <td scope="col">{ticket.agent}</td>
              </tr>
              <tr>
                <td scope="col">PNR:</td>
                <td scope="col">{ticket.bookingCode}</td>
              </tr>
              <tr>
                <td scope="col">Ticket:</td>
                <td scope="col">{ticket.ticketNumber}</td>
              </tr>
              <tr>
                <td scope="col">Cost:</td>
                <td scope="col">{ticket.paidAmount}</td>
              </tr>
              <tr>
                <td scope="col">Receiving Amount/Date 1:</td>
                <td scope="col">
                  {ticket.receivingAmount1}
                  {ticket.receivingAmount1Date &&
                    " - " + ticket.receivingAmount1Date}
                  {" - " + ticket.paymentMethod}
                </td>
              </tr>
              <tr>
                <td scope="col">Receiving Amount/Date/Method 2:</td>
                <td scope="col">
                  {ticket.receivingAmount2}
                  {ticket.receivingAmount2Date &&
                    " - " + ticket.receivingAmount2Date}
                  {ticket.receivingAmount2Method &&
                    " - " + ticket.receivingAmount2Method}
                </td>
              </tr>
              <tr>
                <td scope="col">Receiving Amount/Date/Method 3:</td>
                <td scope="col">
                  {ticket.receivingAmount3}
                  {ticket.receivingAmount3Date &&
                    " - " + ticket.receivingAmount3Date}
                  {ticket.receivingAmount3Method &&
                    " - " + ticket.receivingAmount3Method}
                </td>
              </tr>
              <tr>
                <td scope="col">Profit:</td>
                <td scope="col">{ticket.profit}</td>
              </tr>
              <tr>
                <td scope="col">Issue Date:</td>
                <td scope="col">{ticket.bookedOn}</td>
              </tr>
              <tr>
                <td scope="col">Travel1:</td>
                <td scope="col">{ticket.travel1}</td>
              </tr>
              <tr>
                <td scope="col">Travel2:</td>
                <td scope="col">{ticket.travel2}</td>
              </tr>
              <tr>
                <td scope="col">Flight/Vessel:</td>
                <td scope="col">{ticket.flight}</td>
              </tr>
              <tr>
                <td scope="col">Dates:</td>
                <td scope="col">{ticket.dates}</td>
              </tr>
              <tr>
                <td scope="col">Phone:</td>
                <td scope="col">{ticket.phone}</td>
              </tr>
              {ticket.refund && (
                <>
                  <tr>
                    <td scope="col">Refund/Date/Penality/Used:</td>
                    <td scope="col">
                      {ticket.refund + " - "}
                      {ticket.refundDate && ticket.refundDate + " - "}
                      {ticket.penality + " - "}
                      {ticket.refundUsed}
                    </td>
                  </tr>
                  <tr>
                    <td scope="col">Return/Date:</td>
                    <td scope="col">
                      {ticket.returned + " - "}
                      {ticket.returnedDate && ticket.returnedDate}
                    </td>
                  </tr>
                </>
              )}
              <tr>
                <td scope="col">Extra Notes:</td>
                <td scope="col">{ticket.desc}</td>
              </tr>
            </tbody>
          </table>
        )}
      </Dialog>
    </Layout>
  );
}
