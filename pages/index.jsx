import { ticketsService, userService } from "services";
import { Doughnut, Chart, Pie, PolarArea } from "react-chartjs-2";
import { useEffect, useState } from "react";
import React from "react";
import {
  Chart as ChartJS,
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
  LineController,
  BarController,
  ArcElement,
  TimeScale,
  Title,
  RadialLinearScale,
} from "chart.js";
import { formatDate } from "../services";

ChartJS.register(
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  TimeScale,
  Title,
  Legend,
  Tooltip,
  LineController,
  BarController,
  RadialLinearScale,
  ArcElement
);

export default Home;

function Home() {
  const [profit, setProfit] = useState({});
  const [amounts, setAmounts] = useState({});
  const [methods, setMethods] = useState({});
  const [methodsP, setMethodsP] = useState({});
  const [agents, setAgents] = useState({});
  const [agentsP, setAgentsP] = useState({});
  const [agentsA, setAgentsA] = useState({});
  const [methodsA, setMethodsA] = useState({});
  const [airlines, setAirlines] = useState({});
  const [airlinesList, setAirlinesList] = useState({});
  const [airlinesC, setAirlinesC] = useState({});
  const [total, setTotal] = useState(0);
  const [totalC, setTotalC] = useState(0);
  const [dates, setDates] = useState({});
  const colors = [
    "rgba(255, 99, 132, 0.5)",
    "rgba(54, 162, 235, 0.5)",
    "rgba(255, 206, 86, 0.5)",
    "rgba(75, 192, 192, 0.5)",
    "rgba(153, 102, 255, 0.5)",
    "rgba(255, 159, 64, 0.5)",
  ];

  const pieChart4 =
    Object.keys(agentsA).length > 0 ? (
      <Pie
        data={{
          labels: Object.keys(agentsA),
          datasets: [
            {
              data: Object.values(agentsA),
              label: "Agents",
              backgroundColor: colors.slice(),
              borderColor: colors.slice(),
            },
          ],
        }}
      />
    ) : (
      <div className="text-center">No Data to show</div>
    );

  const pieChart5 =
    Object.keys(methodsA).length > 0 ? (
      <Pie
        data={{
          labels: Object.keys(methodsA),
          datasets: [
            {
              data: Object.values(methodsA),
              label: "Methods",
              backgroundColor: colors.slice(),
              borderColor: colors.slice(),
            },
          ],
        }}
      />
    ) : (
      <div className="text-center">No Data to show</div>
    );

  const pieChart6 =
    Object.keys(airlines).length > 0 ? (
      <PolarArea
        data={{
          labels: Object.keys(airlines),
          datasets: [
            {
              data: Object.values(airlines),
              label: "Tickets",
              backgroundColor: colors.slice(),
              borderColor: colors.slice(),
            },
          ],
        }}
      />
    ) : (
      <div className="text-center">No Data to show</div>
    );

  const pieChart =
    Object.keys(agents).length > 0 ? (
      <Pie
        data={{
          labels: Object.keys(agents),
          datasets: [
            {
              data: Object.values(agents),
              label: "Agents",
              backgroundColor: colors.slice(),
              borderColor: colors.slice(),
            },
          ],
        }}
      />
    ) : (
      <div className="text-center">No Data to show</div>
    );

  const pieChart1 =
    Object.keys(agentsP).length > 0 ? (
      <Doughnut
        data={{
          labels: Object.keys(agentsP),
          datasets: [
            {
              data: Object.values(agentsP),
              label: "Profit",
              backgroundColor: colors.slice(),
              borderColor: colors.slice(),
            },
          ],
        }}
      />
    ) : (
      <div className="text-center">No Data to show</div>
    );

  const pieChart2 =
    Object.keys(methods).length > 0 ? (
      <Pie
        data={{
          labels: Object.keys(methods),
          datasets: [
            {
              data: Object.values(methods),
              label: "Method",
              backgroundColor: colors.slice(),
              borderColor: colors.slice(),
            },
          ],
        }}
      />
    ) : (
      <div className="text-center">No Data to show</div>
    );

  const pieChart3 =
    Object.keys(methodsP).length > 0 ? (
      <Doughnut
        data={{
          labels: Object.keys(methodsP),
          datasets: [
            {
              data: Object.values(methodsP),
              label: "Profit",
              backgroundColor: colors.slice(),
              borderColor: colors.slice(),
            },
          ],
        }}
      />
    ) : (
      <div className="text-center">No Data to show</div>
    );

  const barChart =
    Object.keys(amounts).length > 0 ? (
      <Chart
        type="bar"
        data={{
          labels: Object.keys(amounts),
          datasets: [
            {
              type: "bar",
              label: "Received",
              data: Object.values(amounts).map((a) => a.totalReceivingAmount),
              backgroundColor: colors[0],
            },
            {
              type: "bar",
              label: "Paid",
              data: Object.values(amounts).map((a) => a.paidAmount),
              backgroundColor: colors[1],
            },
          ],
        }}
      />
    ) : (
      <div className="text-center">No Data to show</div>
    );

  const barChart2 =
    Object.keys(amounts).length > 0 ? (
      <Chart
        type="bar"
        data={{
          labels: Object.keys(amounts),
          datasets: [
            {
              type: "line",
              data: Object.values(profit).map((a) => a.profit),
              label: "Profit",
              borderColor: "rgb(75, 192, 192)",
            },
          ],
        }}
      />
    ) : (
      <div className="text-center">No Data to show</div>
    );

  useEffect(() => {
    getProfit();
  }, []);

  const getProfit = (dates = null) => {
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
    }
    setDates({ start, end, type });
    setProfit({});
    setAmounts({});
    setMethods({});
    setMethodsP({});
    setMethodsA({});
    setAgents({});
    setAgentsP({});
    setAgentsA({});
    ticketsService.getProfit({ start, end, type }).then((x) => {
      console.log(x);
      setProfit(x.ticketsP);
      setAmounts(x.ticketsP);
      setMethods(x.methods);
      setMethodsP(x.methodsP);
      setAgents(x.agents);
      setAgentsP(x.agentsP);
      setAgentsA(x.agentsA);
      setMethodsA(x.methodsA);
      setAirlines(x.airlines);
      setAirlinesList(x.airlinesList);
      setAirlinesC(x.airlinesC);
      setTotal(x.total);
      setTotalC(x.totalC);
    });
  };

  const search = () => {
    let start = document.getElementById("start").value;
    let end = document.getElementById("end").value;
    let type = document.getElementById("type").value;
    getProfit({ start, end, type });
  };

  return (
    <>
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
              Search
            </button>
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="container">
          <br />
          <br />
          <br />
          <div className="row">
            <div className="col-md-6">
              <h4 className="drag-text">Paid vs Received Amount</h4>
              {barChart}
            </div>
            <div className="col-md-6">
              <h4 className="drag-text">Profit</h4>
              {barChart2}
            </div>
          </div>
          <div className="row">
            <div className="col-6 col-xs-12 col-xl-3">
              <br />
              <h4 className="drag-text">Agents</h4>
              {pieChart}
            </div>
            <div className="col-6 col-xs-12 col-xl-3">
              <br />
              <h4 className="drag-text">Payment Methods</h4>
              {pieChart2}
            </div>
            <div className="col-6 col-xs-12 col-xl-3">
              <br />
              <h4 className="drag-text">Profit by Agents</h4>
              {pieChart1}
            </div>
            <div className="col-6 col-xs-12 col-xl-3">
              <br />
              <h4 className="drag-text">Profit by Methods</h4>
              {pieChart3}
            </div>
            <div className="col-6 col-xs-12 col-xl-3">
              <br />
              <h4 className="drag-text">Payments by Agents</h4>
              {pieChart4}
            </div>
            <div className="col-6 col-xs-12 col-xl-3">
              <br />
              <h4 className="drag-text">Pay. by Methods</h4>
              {pieChart5}
            </div>
            <div className="col-12 col-xs-12 col-xl-12">
              <br />
              <h4 className="drag-text">Bookings</h4>
              {pieChart6}
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th style={{ width: "40%" }}>Name</th>
                      <th style={{ width: "20%" }}>Bookings</th>
                      <th style={{ width: "20%" }}>Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <b>Total</b>
                      </td>
                      <td>
                        <b>{total}</b>
                      </td>
                      <td>
                        <b>{totalC.toFixed(2)}</b>
                      </td>
                    </tr>
                    {Object.keys(airlinesList) &&
                      Object.keys(airlinesList).map((airline, i) => (
                        <tr key={i}>
                          <td>{airline}</td>
                          <td>
                            {airlinesList[airline]} (
                            {(
                              (parseInt(airlinesList[airline]) * 100) /
                              parseInt(total)
                            ).toFixed(2)}
                            %)
                          </td>
                          <td>
                            {airlinesC[airline].toFixed(2)} (
                            {(
                              (parseFloat(airlinesC[airline]) * 100) /
                              parseFloat(totalC)
                            ).toFixed(2)}
                            %)
                          </td>
                        </tr>
                      ))}
                    <tr>
                      <td>
                        <b>Total</b>
                      </td>
                      <td>
                        <b>{total}</b>
                      </td>
                      <td>
                        <b>{totalC.toFixed(2)}</b>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
