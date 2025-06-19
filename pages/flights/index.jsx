import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Spinner } from "components";
import { Layout } from "components/tickets";
import { ticketsService, flightsService } from "services";

export default Index;

function Index() {
  const [tickets, setTickets] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [ticketDialog, setTicketDialog] = useState(false);
  useEffect(() => {
    ticketsService.getFlights().then((x) => setTickets(x));
  }, []);

  const checkin = (ticket) => {
    //console.log(ticket);
    window.open(ticket.url, "_blank");
    //flightsService.setFlights().then((y) => console.log(y));
  };

  const infoTicket = (ticket) => {
    setTicket(ticket);
    setTicketDialog(true);
  };

  return (
    <Layout>
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th style={{ width: "10%" }}>Name</th>
              <th style={{ width: "10%" }}>PNR</th>
              <th style={{ width: "10%" }}>Airline</th>
              <th style={{ width: "10%" }}>Date</th>
              <th style={{ width: "10%" }}></th>
            </tr>
          </thead>
          <tbody>
            {tickets &&
              tickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td>{ticket.name}</td>
                  <td>{ticket.bookingCode}</td>
                  <td>{ticket.flight}</td>
                  <td>{ticket.dates}</td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <button
                      onClick={() => infoTicket(ticket)}
                      className="btn btn-sm btn-secondary"
                      hidden={false}
                    >
                      <i className="fa fa-info"></i>
                      &nbsp;Info
                    </button>
                    &nbsp;
                    <button
                      onClick={() => checkin(ticket)}
                      className="btn btn-sm btn-primary"
                      hidden={!ticket.isFlight}
                    >
                      <i className="fa fa-plane"></i>
                      &nbsp;Check In
                    </button>
                  </td>
                </tr>
              ))}
            {!tickets && (
              <tr>
                <td colSpan="5">
                  <Spinner />
                </td>
              </tr>
            )}
            {tickets && !tickets.length && (
              <tr>
                <td colSpan="5" className="text-center">
                  <div className="p-2">No flights in next 2 days</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
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
