import { fetchWrapper } from "helpers";
import { cleanFlight, formatDate } from "./index";

const baseUrl = `/api/tickets`;
const usersUrl = "/api/users";
const airlinesUrl = "/api/flights";
const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const ticketsService = {
  getAll,
  create,
  update,
  delete: _delete,
  upload,
  getById,
  getProfit,
  getRefundsForSupply,
  getTicketsForSupply,
  getTicketsByAgent,
  getFlights,
};

async function getTicketsForSupply(filters = {}) {
  const response = await fetchWrapper.post(baseUrl + "/supply", filters);
  return response;
}

async function getFlights() {
  const response = await fetchWrapper.post(baseUrl + "/flights", {});
  const airlinesI = await fetchWrapper.get(airlinesUrl);
  const airlinesN = airlinesI.map((a) => a.name);
  let flights = [];
  response.map((r) => {
    let url = "";
    let flight = cleanFlight(r);
    if (airlinesN.includes(flight)) {
      url = airlinesI.filter((a) => a.name === flight)[0].url;
    }
    let isFlight = !!url;
    flights.push({ ...r, url, isFlight });
  });
  let tickets = getAll({}, flights);
  return tickets;
}

async function getTicketsByAgent(filters = {}) {
  const response = await fetchWrapper.post(baseUrl + "/agent", filters);
  let res = response.filter((t) => t.agentId === filters.agentId);
  return res;
}

async function getAll(filters, flights = []) {
  const response = flights.length
    ? flights
    : await fetchWrapper.post(baseUrl, filters);
  const users = await fetchWrapper.get(usersUrl);
  const tickets = response.map((t, i) => {
    let bkd = formatDate(t.bookedOn, "IT");
    let ra1d = t.receivingAmount1Date
      ? formatDate(t.receivingAmount1Date, "IT")
      : "";
    let ra2d = t.receivingAmount2Date
      ? formatDate(t.receivingAmount2Date, "IT")
      : "";
    let ra3d = t.receivingAmount3Date
      ? formatDate(t.receivingAmount3Date, "IT")
      : "";
    let tk2 = t.paidAmount.trim() ? parseFloat(t.paidAmount) : 0;
    let tra = t.receivingAmount1.trim()
      ? (parseFloat(t.receivingAmount1) || 0) +
        (parseFloat(t.receivingAmount2) || 0) +
        (parseFloat(t.receivingAmount3) || 0)
      : 0;
    let profit = parseFloat((tra - tk2).toFixed(2));
    let methods =
      t.paymentMethod +
      (t.receivingAmount2Method ? " - " + t.receivingAmount2Method : "") +
      (t.receivingAmount3Method ? " - " + t.receivingAmount3Method : "");
    let penality = t.refund
      ? parseFloat(t.paidAmount) - parseFloat(t.refund)
      : "";
    let amountsCompleted = profit >= 0;
    let agent = users.filter((u) => u.id === t.agentId);
    if (agent) {
      agent = agent.hasOwnProperty(0)
        ? agent[0].firstName + " " + agent[0].lastName
        : "Not Found";
      agent = agent.toLowerCase().includes("agency") ? "" : agent;
    }
    return {
      ...t,
      profit: "€ " + profit,
      bookedOn: bkd,
      receivingAmount1Date: ra1d,
      receivingAmount2Date: ra2d,
      receivingAmount3Date: ra3d,
      idP: i + 1,
      receivingAmountT: "€ " + tra.toFixed(2),
      paidAmount: "€ " + t.paidAmount,
      agent,
      agentCost: t.agentCost && agent ? "€ " + t.agentCost : "",
      methods: methods,
      refund: t.refund ? "€ " + t.refund : t.refund,
      refundUsed: t.refundUsed ? "€ " + t.refundUsed : t.refundUsed,
      refundDate: t.refundDate ? formatDate(t.refundDate, "IT") : t.refundDate,
      returned: t.returned ? "€ " + t.returned : t.returned,
      returnedDate: t.returnedDate
        ? formatDate(t.returnedDate, "IT")
        : t.returnedDate,
      supplied: t.supplied ? "€ " + t.supplied : t.supplied,
      paidByAgent: t.paidByAgent ? "€ " + t.paidByAgent : t.paidByAgent,
      penality: penality !== "" ? "€ " + parseFloat(penality).toFixed(2) : "",
      amountsCompleted: amountsCompleted,
    };
  });
  return tickets;
}

async function create(ticket) {
  await fetchWrapper.post(`${baseUrl}/create`, ticket);
}

async function update(id, params) {
  await fetchWrapper.put(`${baseUrl}/${id}`, params);
}

async function findAndUpdate(ticket) {
  await fetchWrapper.put(baseUrl, ticket);
}

async function _delete(id) {
  await fetchWrapper.delete(`${baseUrl}/${id}`);
}

async function getById(id) {
  return await fetchWrapper.get(`${baseUrl}/${id}`);
}

async function getRefundsForSupply(filters = {}) {
  const result = await fetchWrapper.post(baseUrl + "/refund", filters);
  return result;
}

async function getProfit(filters) {
  const users = await fetchWrapper.get(usersUrl);
  const result = await fetchWrapper.post(baseUrl + "/profit", filters);
  let ticketsP = {};
  let methods = {};
  let agents = {};
  let agentsP = {};
  let methodsP = {};
  let agentsA = {};
  let methodsA = {};
  let airlines = {};
  let airlinesC = {};
  let total = 0;
  let totalC = 0;
  result.map((ticket) => {
    let date = new Date(ticket.bookedOn);
    let key = months[date.getMonth()] + " " + date.getFullYear();
    let method1 =
      (ticket.paymentMethod && ticket.paymentMethod.trim().toUpperCase()) ||
      "None";
    let method2 =
      (ticket.receivingAmount2Method &&
        ticket.receivingAmount2Method.trim().toUpperCase()) ||
      "None";
    let method3 =
      (ticket.receivingAmount3Method &&
        ticket.receivingAmount3Method.trim().toUpperCase()) ||
      "None";
    let agent = users.filter((u) => ticket.agentId === u.id);
    if (agent) {
      agent = agent.hasOwnProperty(0)
        ? agent[0].firstName + " " + agent[0].lastName
        : "Not Found";
    }
    if (methods[method1] !== undefined) {
      methods[method1] += 1;
    } else {
      methods[method1] = 1;
    }
    if (agents[agent] !== undefined) {
      agents[agent] += 1;
    } else {
      agents[agent] = 1;
    }

    let totalReceivingAmount1 = parseFloat(ticket.receivingAmount1) || 0;
    let totalReceivingAmount2 = parseFloat(ticket.receivingAmount2) || 0;
    let totalReceivingAmount3 = parseFloat(ticket.receivingAmount3) || 0;
    let totalReceivingAmount =
      totalReceivingAmount1 + totalReceivingAmount2 + totalReceivingAmount3;

    let paidAmount = parseFloat(ticket.paidAmount);
    let profit = totalReceivingAmount - paidAmount;

    if (ticketsP[key] !== undefined) {
      ticketsP[key].totalReceivingAmount += totalReceivingAmount;
      ticketsP[key].paidAmount += paidAmount;
      ticketsP[key].profit += profit;
    } else {
      ticketsP[key] = { totalReceivingAmount, paidAmount, profit };
    }

    if (
      [
        "receivingAmount1Date",
        "receivingAmount2Date",
        "receivingAmount3Date",
      ].includes(filters.type)
    ) {
      if (filters.type === "receivingAmount1Date") {
        if (methodsA[method1] !== undefined) {
          methodsA[method1] += totalReceivingAmount1;
        } else {
          methodsA[method1] = totalReceivingAmount1;
        }
      }
      if (filters.type === "receivingAmount2Date") {
        if (methodsA[method2] !== undefined) {
          methodsA[method2] += totalReceivingAmount2;
        } else {
          methodsA[method2] = totalReceivingAmount2;
        }
      }
      if (filters.type === "receivingAmount3Date") {
        if (methodsA[method3] !== undefined) {
          methodsA[method3] += totalReceivingAmount3;
        } else {
          methodsA[method3] = totalReceivingAmount3;
        }
      }
    } else {
      if (methodsP[method1] !== undefined) {
        methodsP[method1] += profit;
      } else {
        methodsP[method1] = profit;
      }

      if (agentsP[agent] !== undefined) {
        agentsP[agent] += profit;
      } else {
        agentsP[agent] = profit;
      }

      if (agentsA[agent] !== undefined) {
        agentsA[agent] += totalReceivingAmount;
      } else {
        agentsA[agent] = totalReceivingAmount;
      }

      if (methodsA[method1] !== undefined) {
        methodsA[method1] += totalReceivingAmount1;
      } else {
        methodsA[method1] = totalReceivingAmount1;
      }
      if (methodsA[method2] !== undefined) {
        methodsA[method2] += totalReceivingAmount2;
      } else {
        methodsA[method2] = totalReceivingAmount2;
      }
      if (methodsA[method3] !== undefined) {
        methodsA[method3] += totalReceivingAmount3;
      } else {
        methodsA[method3] = totalReceivingAmount3;
      }
    }

    let flight = cleanFlight(ticket);
    if (!Object.keys(airlines).includes(flight)) {
      airlines[flight] = 1;
    } else {
      airlines[flight] += 1;
    }
    total += 1;

    if (!Object.keys(airlinesC).includes(flight)) {
      airlinesC[flight] = paidAmount;
    } else {
      airlinesC[flight] += paidAmount;
    }
    totalC += paidAmount;
  });

  const airlines1 = Object.entries(airlines);
  function compareValues(a, b) {
    return b[1] - a[1];
  }
  const sortedAirlines1 = airlines1.sort(compareValues);
  const sortedAirlines2 = Object.fromEntries(sortedAirlines1);

  return {
    ticketsP,
    methods,
    methodsP,
    agents,
    agentsP,
    agentsA,
    methodsA,
    airlines,
    airlinesList: sortedAirlines2,
    total,
    airlinesC,
    totalC,
  };
}

function isNumeric(str) {
  const numericRegex = /^\d+$/;
  return numericRegex.test(str);
}

async function upload(files) {
  const users = await fetchWrapper.get(usersUrl);
  let fc = [];
  files.map((ct) => {
    let final = [];
    const dr = ct.split("\n").map(function (ln) {
      return ln.split(";");
    });

    dr.map((dC) => {
      let manipulated = [];
      dC.map((cl) => {
        cl = cl.trim();
        if (cl) {
          manipulated.push(cl);
        }
      });
      final.push(manipulated);
    });

    // console.log(final, final.length);
    let iac = { 38286592: "SCA", 38288331: "INDUS" };
    let agl = {};
    let admin = "";
    let agency = "";
    users.map((userT) => {
      let nameT = userT.firstName + " " + userT.lastName;
      if (userT.level === "admin") {
        admin = userT.id;
      }
      if (nameT.toLowerCase().includes("agency")) {
        agency = userT.id;
      }
      agl[userT.code] = userT.id;
    });
    let ard = [];
    let t = [];
    let n = [];
    let ia = "";
    let ofi = "";
    if (
      final.hasOwnProperty(3) &&
      final[3].hasOwnProperty(3) &&
      isNumeric(final[3][3])
    ) {
      ofi = final[3][3];
    } else {
      ofi = "-";
    }
    if (
      final.hasOwnProperty(3) &&
      final[3].hasOwnProperty(6) &&
      isNumeric(final[3][6])
    ) {
      ia = final[3][6];
    } else if (
      final.hasOwnProperty(3) &&
      final[3].hasOwnProperty(9) &&
      isNumeric(final[3][9])
    ) {
      ia = final[3][9];
    } else {
      ia = "-";
    }
    let c2 = "-";
    let ag = "";
    let ac = "";
    let mt = "";
    let d = "-";
    let dor = "-";
    let tk = "";
    let tk2 = "";
    let tra = "";
    let tra1D = "";
    let tra2D = "";
    let tra3D = "";
    let pr = 0;
    let tn = "";
    let tc = "-";
    let cn = "-";
    let cni = "-";
    let p = "-";
    let vd = false;
    let f =
      final.hasOwnProperty(4) && final[4].hasOwnProperty(0) ? final[4][0] : "-";

    for (let r = 0; r < final.length; r++) {
      for (let c = 0; c < final[r].length; c++) {
        if (r === 1 && final[r].join("").includes("VOID")) {
          vd = true;
        }
        if (final[r][c].includes("I-00")) {
          n.push(final[r][c + 1].replace(/[^a-zA-Z/ ]/g, " ").trim());
        }
        if (final[r][c].includes("T-K")) {
          t.push(final[r][c].replace("T-K", "").trim());
        }
        if (final[r][c].includes("MUC1A")) {
          c2 = final[r][c].replace("MUC1A ", "").trim();
          c2 = c2.slice(0, -3);
        }
        if (final[r][c].includes("RM*A*")) {
          ag = final[r][c].replace("RM*A*", "");
        }
        if (final[r][c].includes("RM*AC*")) {
          ac = final[r][c].replace("RM*AC*", "");
          ac = ac.trim() ? parseFloat(ac) : 0;
        }
        if (final[r][c].includes("RM*P*")) {
          mt = final[r][c].replace("RM*P*", "");
        }
        if (final[r][c].includes("D-")) {
          let dates = final[r];
          let datesC = dates.length;
          d = dates[datesC - 1].replace("D-", "").trim();
          dor = d;
          if (d.length === 6) {
            let y = "20" + d[0] + d[1];
            let m = d[2] + d[3];
            let g = d[4] + d[5];
            d = `${y}-${m}-${g}`;
          } else {
            d = formatDate(new Date());
          }
        }
        if (final[r][c].includes("K-F")) {
          if (final[r][c].includes("K-FEUR")) {
            tk = final[r][c].replace("K-FEUR", "").trim();
            tk2 = final[r][c + 1].replace("EUR", "").trim();
          } else {
            tk = final[r][c + 1].replace("K-FEUR", "").trim();
            tk2 = final[r][c + 2].replace("EUR", "").trim();
          }
        }
        if (final[r][c].includes("RM*R*")) {
          tra = final[r][c].replace("RM*R*", "");
          tra1D = d;
        }
        if (final[r][c].includes("KN-I")) {
          tk = final[r][c].replace("KN-IEUR", "").trim();
          tk2 = final[r][c + 1].replace("EUR", "").trim();
        }
        if (final[r][c].includes("N-")) {
          if (final[r][c].includes("EUR")) {
            tn = final[r][c].replace("N-EUR", "").trim();
          }
          if (final[r][c].includes("NUC")) {
            tn = final[r][c].replace("N-NUC", "").trim();
          }
        }
        if (final[r][c].includes("T-L")) {
          tc = final[r][c].replace("T-L", "").trim();
        }
        if (final[r][c].includes("FPD")) {
          cn = final[r][c].replace("MFPDCCA", "").trim();
          cn = cn.split("/")[0];
        }
        //console.log(ia, final[r][c].includes("FPCC"));
        if (final[r][c].includes("FPCC") && ia === "38288331") {
          //cni = final[r][c].replace("FPCC", "").trim();
          let cniT = final[r][c].split("/")[0];
          //console.log(cniT);
          cni = cniT[4] + cniT[5] + cniT.slice(-4);
          //console.log(cniT);
        }
        if (final[r][c].includes("CTCM")) {
          let tph = final[r][c].split("/");
          p = tph.hasOwnProperty(1) && tph[1];
        }
        if (final[r][c].includes("H-")) {
          ard.push(final[r]);
        }
      }
    }

    let dstr = "";
    let t1s = "";
    let t2s = "";
    let mnts = months.map((m) => m.toLowerCase());
    let cm = new Date().getMonth() + 1;
    let cd = new Date().getDate();
    for (let i = 0; i < ard.length; i++) {
      let dd = ard[i][5];
      let dd2 = dd.split(" ");
      let d2l = dd2.length;
      let dfm = dd2[d2l - 1].slice(-3);
      if (mnts.includes(dfm.toLowerCase())) {
        let dfd = dd2[d2l - 1].slice(0, 2);
        dfm = mnts.indexOf(dfm.toLowerCase()) + 1;
        dfm = dfm < 10 ? "0" + dfm : dfm;
        let dfy = d.slice(0, 4);
        if (
          parseInt(dfm) < cm ||
          (parseInt(dfm) === cm && parseInt(dfd) < cd)
        ) {
          dfy = parseInt(dfy) + 1;
        }
        dstr += dfd + "/" + dfm + "/" + dfy + " - ";
      } else {
        dstr += dd2[d2l - 1] + " - ";
      }
      t1s += ard[i][2] + " - ";
      t2s += ard[i][4] + " - ";
    }

    dstr = dstr.replace(/-\s*$/, "").trim();
    t1s = t1s.replace(/-\s*$/, "").trim();
    t2s = t2s.replace(/-\s*$/, "").trim();
    tk = tk.trim() ? parseFloat(tk) : 0;
    tk2 = tk2.trim() ? parseFloat(tk2) : 0;
    tra = tra.trim() ? parseFloat(tra) : 0;
    tn = tn.trim() ? parseFloat(tn) : 0;
    pr = parseFloat((tra - tk2).toFixed(2));
    let ntl = n.length;
    n.map((ntp, i) => {
      let tkt = {
        name: ntp,
        bookingCode: c2,
        agent: agl.hasOwnProperty(ag) ? agl[ag] : ag,
        agentId: agl.hasOwnProperty(ag)
          ? agl[ag]
          : agency || admin || "123456789012345678901234",
        iata: iac.hasOwnProperty(ia) ? iac[ia] : ia,
        office: iac.hasOwnProperty(ofi) ? iac[ofi] : ofi,
        agentCost: ac !== "" ? ac : 0,
        ticketNumber: t.length ? t[i] : tc,
        paymentMethod: mt,
        paidAmount: tk2,
        receivingAmount1: tra,
        receivingAmount1Date: tra1D,
        receivingAmount2Date: tra2D,
        receivingAmount2Method: "",
        receivingAmount3Date: tra3D,
        receivingAmount3Method: "",
        receivingAmount2: 0,
        receivingAmount3: 0,
        cardNumber: cni,
        isVoid: vd,
        bookedOn: d,
        travel1: t1s,
        travel2: t2s,
        dates: dstr,
        phone: p,
        flight: f,
        refund: "",
        refundDate: "",
        desc: "",
        supplied: 0,
        returned: 0,
        returnedDate: "",
        paidByAgent: 0,
      };
      fc.push(tkt);
    });
  });
  let created = [];
  fc.map((f) => {
    if (f?.ticketNumber && f?.isVoid) {
      let params = {
        ticketNumber: f?.ticketNumber,
        agentCost: 0,
        paidAmount: 0,
        receivingAmount1: 0,
        receivingAmount2: 0,
        receivingAmount3: 0,
        refund: "",
        supplied: 0,
        returned: 0,
        paidByAgent: 0,
        isVoid: "true",
      };
      //console.log(f);
      findAndUpdate(params);
    } else {
      if (f?.ticketNumber && !created.includes(f.ticketNumber)) {
        //console.log(f);
        create(f);
        created.push(f.ticketNumber);
      }
    }
  });
}
