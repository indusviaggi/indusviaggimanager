import { Layout } from "components/users";
import React, { useState, useEffect, useRef } from "react";
import Router from "next/router";
import {
  formatDate,
  agentsOperationsService,
  ticketsService,
  userService,
} from "../../services";
import { Spinner } from "components";
import Swal from "sweetalert2";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
export default Index;

function Index() {
  const [operations, setOperations] = useState(null);
  const [agents, setAgents] = useState(null);
  const [totals, setTotals] = useState({
    supplied: 0,
    adjusted: 0,
    total: 0,
    balance: 0,
  });
  const [opPdf, setOpPdf] = useState(null);
  const [dates, setDates] = useState({
    start: "",
    end: "",
    type: "",
    agent: null,
  });
  const swal = Swal.mixin({
    customClass: {
      confirmButton: "m-1 btn btn-success",
      cancelButton: "btn btn-danger",
    },
    buttonsStyling: false,
  });

  useEffect(() => {
    getAgents();
    getOperations();
  }, []);

  function getAgents() {
    userService.getAllAgents().then((res) => {
      let ags = res.filter(
        (ag) =>
          !(ag.firstName + " " + ag.lastName).toLowerCase().includes("agency")
      );
      setAgents(ags);
    });
  }
  const removeBonifico = (e, transfer) => {
    e.preventDefault();
    e.stopPropagation();
    swal
      .fire({
        title: "Are you sure?",
        text: "You want to delete these operations from database?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "Cancel",
        reverseButtons: true,
      })
      .then((result) => {
        if (result.isConfirmed) {
          const resp = onComplete(transfer);
          if (!resp.errorU && !resp.errorR) {
            swal
              .fire(
                "Saved",
                "Your operations has been deleted successfully.",
                "success"
              )
              .then((res) => {
                if (res.isDismissed || res.isConfirmed) {
                  window.location.reload();
                }
              });
          } else {
            swal.fire(
              "Error!",
              "An error occurred while deleting operations.",
              "error"
            );
          }
        }
      });
  };

  const onComplete = (transfer) => {
    let errorU = false;
    let errorR = false;
    transfer.map((op) => {
      if (op?.ticket && op.ticket[0]) {
        let suppliedTicket = parseFloat(op.suppliedTicketN);
        let paidByAgent = op.ticket[0].paidByAgent
          ? parseFloat(op.ticket[0].paidByAgent)
          : null;
        paidByAgent = paidByAgent ? paidByAgent - suppliedTicket : 0;
        let params = {
          paidByAgent:
            paidByAgent && Math.sign(paidByAgent) !== -1 ? paidByAgent : 0,
        };
        ticketsService
          .update(op.ticketId, params)
          .catch((err) => (errorU = true));
      }
      agentsOperationsService.delete(op.cid).catch((err) => (errorR = true));
    });
    return { errorU, errorR };
  };

  const getOperations = (datesX = null) => {
    let start = new Date();
    //start.setMonth(start.getMonth() - 6);
    start.setDate(1);
    start = formatDate(start);
    let end = formatDate(new Date());
    let type = "transferDate";
    let agent = null;
    if (datesX) {
      start = datesX.start;
      end = datesX.end;
      type = datesX.type;
      agent = datesX.agent === "all" ? null : datesX.agent;
    } else {
      setDates({ start, end, type, agent });
    }
    agentsOperationsService.getAll({ start, end, type, agent }).then((res) => {
      let res2 = res.data;
      if (datesX && datesX.agent && datesX.agent !== "all") {
        res2 = res.data.filter((r) => r.agentId === datesX.agent);
      }
      const operationsI = res2.reduce((group, arr) => {
        const { transferName } = arr;
        group[transferName] = group[transferName] ?? [];
        group[transferName].push(arr);
        return group;
      }, {});

      setOpPdf(res.tickets);
      setOperations(operationsI);

      let transferAmountTotalOperationI = 0;
      let balanceAmountTotalOperationI = 0;
      let adjustedAmountTotalOperationI = 0;
      Object.keys(operationsI).map((i) => {
        transferAmountTotalOperationI += parseFloat(
          operationsI[i][0].transferOperationN
        );
        balanceAmountTotalOperationI += parseFloat(
          operationsI[i][0].balanceOperationN
        );
        adjustedAmountTotalOperationI += parseFloat(
          operationsI[i][0].suppliedTotalN
        );
      });
      setTotals({
        total:
          "€ " +
          parseFloat(
            transferAmountTotalOperationI + balanceAmountTotalOperationI
          ).toFixed(2),
        supplied: "€ " + transferAmountTotalOperationI.toFixed(2),
        balance: "€ " + balanceAmountTotalOperationI.toFixed(2),
        adjusted: "€ " + adjustedAmountTotalOperationI.toFixed(2),
      });
    });
  };

  const addNew = () => {
    Router.push("/buyer/transfer");
  };

  const download = (type) => {
    if (type === 1) {
      //console.log(opExcel);
      const headers = [
        "Name",
        "PNR",
        "Operation",
        "Agent Cost",
        "Total Paid By Agent",
        "Remained to pay",
        "Paid with Operation",
      ];
      let csvStringT = [];
      Object.keys(operations).map((o, i) => {
        let opExcel = operations[o];
        csvStringT.push(
          [
            [
              opExcel[0].agentName,
              opExcel[0].method,
              opExcel[0].transferDate,
              opExcel[0].transferOperation.replace("€", "Eur"),
              opExcel[0].balanceOperation.replace("€", "Eur"),
              opExcel[0].suppliedTotal.replace("€", "Eur"),
            ],
            headers,
          ],
          opExcel.map((i) => [
            i.name,
            i.bookingCode,
            i.operation,
            i.paidAmount.replace("€", "Eur"),
            i.supplied.replace("€", "Eur"),
            i.remainedSupplied.replace("€", "Eur"),
            i.suppliedTicket.replace("€", "Eur"),
          ]),
          [[]]
        );
        //console.log(oy, o, i);
      });
      const csvStringN = csvStringT.reduce((acc, arr) => acc.concat(arr), []);

      let csvString = csvStringN.map((e) => e.join(";")).join("\n");
      //console.log(csvStringT, csvStringN, csvString);

      const csvContent = "data:text/csv;charset=utf-8," + csvString;
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "agentsoperations_" + Date.now() + ".csv");
      document.body.appendChild(link);

      link.click();
    } else {
      const headers = [
        [
          "Name",
          "Booking Date",
          "PNR",
          "Ticket N.",
          "Cost",
          "Paid",
          "Remained",
        ],
      ];
      let agentCost = 0;
      let paidByAgent = 0;
      let remainedT = 0;
      const data = opPdf.map((o) => {
        agentCost += parseFloat(o.agentCost);
        paidByAgent += parseFloat(o.paidByAgent);
        let remained = parseFloat(o.agentCost) - parseFloat(o.paidByAgent);
        remainedT += remained;
        return [
          o.name,
          formatDate(o.bookedOn, "it"),
          o.bookingCode,
          o.ticketNumber,
          "€ " + o.agentCost,
          "€ " + o.paidByAgent,
          "€ " + parseFloat(remained).toFixed(2),
        ];
      });

      //console.log(operations, opPdf);
      const imgData = "logo.png";
      const doc = new jsPDF();
      let row = 10;

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
      doc.text(
        "Total Cost: € " +
          parseFloat(agentCost).toFixed(2) +
          " - Total Paid: € " +
          parseFloat(paidByAgent).toFixed(2) +
          " - Remained: € " +
          parseFloat(remainedT).toFixed(2),
        10,
        row,
        null,
        null,
        "left"
      );
      row += 2;
      doc.setDrawColor(120, 120, 120);
      doc.line(10, row, 200, row);
      doc.setFontSize(10);
      row += 2;

      let content = {
        startY: row,
        head: headers,
        body: data,
      };
      doc.autoTable(content);

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
      doc.save("agentsoperations_" + Date.now() + ".pdf");
    }
  };

  const search = () => {
    let start = document.getElementById("start").value;
    let end = document.getElementById("end").value;
    let type = document.getElementById("type").value;
    let agent = document.getElementById("agent").value;
    getOperations({ start, end, type, agent });
  };

  return (
    <Layout>
      <div className="container">
        <div className="row">
          <div className="col-md-2">
            <label htmlFor="agent">Agent:</label>
            <div className="input-group">
              <select id="agent" className="form-select">
                <option value="all">All Agents</option>
                {agents &&
                  agents.map((agent, index) => {
                    return (
                      <option key={"agent" + index} value={agent.id}>
                        {agent.firstName} {agent.lastName}
                      </option>
                    );
                  })}
              </select>
            </div>
          </div>
          <div className="col-md-2">
            <label htmlFor="type">Type:</label>
            <div className="input-group">
              <select id="type" className="form-select">
                <option value="transferDate">Transfer Date</option>
              </select>
            </div>
          </div>
          <div className="col-md-2">
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
          <div className="col-md-2">
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
          <div className="col-md-1 col-sm-3">
            <button
              type="submit"
              className="btn btn-block btn-primary width-search"
              onClick={() => {
                search();
              }}
            >
              <i className="fa fa-search"></i>
            </button>
          </div>
          <div className="col-md-1 col-sm-3">
            <button
              className="btn btn-block btn-warning width-search"
              onClick={() => {
                download(1);
              }}
            >
              <i className="fa fa-download"></i>
            </button>
          </div>
          <div className="col-md-1 col-sm-3">
            <button
              className="btn btn-block btn-danger width-search"
              onClick={() => {
                download(2);
              }}
            >
              <i className="fa fa-download"></i>
            </button>
          </div>
          <div className="col-md-1 col-sm-3">
            <button
              className="btn btn-block btn-success width-search"
              onClick={() => {
                addNew();
              }}
            >
              <i className="fa fa-add"></i>
            </button>
          </div>
        </div>
      </div>
      <br />
      <div className="card">
        <div className="container">
          <div className="table-responsive">
            <br />
            <table className="table table-striped accordion">
              {operations && Object.keys(operations).length ? (
                <tbody>
                  <tr>
                    <th>
                      Total: {totals.supplied} ({totals.supplied} +{" "}
                      {totals.balance}) - Adjusted: {totals.adjusted}
                    </th>
                  </tr>
                  <tr></tr>
                  {Object.keys(operations).map((key, i) => {
                    return (
                      <React.Fragment key={"i" + i}>
                        <tr data-bs-toggle="collapse" data-bs-target={"#r" + i}>
                          <th scope="row">
                            {i + 1 + " - " + operations[key][0]["method"]}
                            {" - " + operations[key][0]["agentName"]}
                            {" - " + operations[key][0]["transferDate"]}
                            {" - " + operations[key][0]["transferOperation"]}
                            {" (" + operations[key][0]["transferOperation"]}
                            {" + " +
                              operations[key][0]["balanceOperation"] +
                              ") "}
                            {" - Adjusted: " +
                              operations[key][0]["suppliedTotal"]}
                            <i
                              className="fa fa-times tb-btns"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                removeBonifico(e, operations[key]);
                              }}
                            ></i>
                          </th>
                        </tr>
                        <tr
                          className="collapse accordion-collapse"
                          id={"r" + i}
                          data-bs-parent=".table"
                        >
                          <td>
                            <table className="table table-striped accordion">
                              {Object.keys(operations[key]).length ? (
                                <tbody>
                                  <tr>
                                    <td scope="row">Name</td>
                                    <td scope="row">PNR</td>
                                    <td scope="row">Operation</td>
                                    <td scope="row">Agent Cost</td>
                                    <td scope="row">Total Paid By Agent</td>
                                    <td scope="row">Remained to Pay</td>
                                    <td scope="row">Paid with Operation</td>
                                  </tr>
                                  {Object.keys(operations[key]).map(
                                    (key2, i2) => {
                                      return (
                                        <React.Fragment key={"i2" + i2}>
                                          <tr>
                                            <td scope="row">
                                              {operations[key][key2]["name"]}
                                            </td>
                                            <td scope="row">
                                              {
                                                operations[key][key2][
                                                  "bookingCode"
                                                ]
                                              }
                                            </td>
                                            <td scope="row">
                                              {
                                                operations[key][key2][
                                                  "operation"
                                                ]
                                              }
                                            </td>
                                            <td scope="row">
                                              {
                                                operations[key][key2][
                                                  "paidAmount"
                                                ]
                                              }
                                            </td>
                                            <td scope="row">
                                              {
                                                operations[key][key2][
                                                  "supplied"
                                                ]
                                              }
                                            </td>
                                            <td scope="row">
                                              {
                                                operations[key][key2][
                                                  "remainedSupplied"
                                                ]
                                              }
                                            </td>
                                            <td scope="row">
                                              {
                                                operations[key][key2][
                                                  "suppliedTicket"
                                                ]
                                              }
                                            </td>
                                          </tr>
                                        </React.Fragment>
                                      );
                                    }
                                  )}
                                </tbody>
                              ) : null}
                            </table>
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              ) : !operations ? (
                <tbody>
                  <tr>
                    <td colSpan="4">
                      <Spinner />
                    </td>
                  </tr>
                </tbody>
              ) : (
                <tbody>
                  <tr>
                    <td>No transfers found.</td>
                  </tr>
                </tbody>
              )}
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
