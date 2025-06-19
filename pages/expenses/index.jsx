import { Layout } from "components/expenses";
import React, { useState, useEffect, useRef } from "react";
import Router from "next/router";
import { formatDate, expensesService, ticketsService } from "../../services";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ColumnGroup } from "primereact/columngroup";
import { Row } from "primereact/row";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { FilterMatchMode } from "primereact/api";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Tag } from "primereact/tag";
export default Index;

function Index() {
  const [expenses, setExpenses] = useState(null);
  const dt = useRef(null);
  const [loading, setLoading] = useState(false);
  const [expense, setExpense] = useState(null);
  const [deleteExpenseDialog, setDeleteExpenseDialog] = useState(false);
  const [dates, setDates] = useState({
    start: "",
    end: "",
    type: "",
  });
  const [totals, setTotals] = useState([0]);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const allFilters = [
    "title",
    "desc",
    "category",
    "subcategory",
    "type",
    "paymentMethod",
    "amount",
    "paymentDate",
    "status",
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

  useEffect(() => {
    getExpenses();
  }, []);

  const getExpenses = (dates = null) => {
    setLoading(true);
    let start = new Date();
    //start.setMonth(start.getMonth() - 6);
    start.setDate(1);
    start = formatDate(start);
    let end = formatDate(new Date());
    let type = "paymentDate";
    if (dates) {
      start = dates.start;
      end = dates.end;
      type = dates.type;
    } else {
      setDates({ start, end, type });
    }
    expensesService.getAll({ start, end, type }).then((res) => {
      setExpenses(res);
      onGlobalFilterChange({ target: { value: "" } });
      setLoading(false);
    });
  };

  const addNew = () => {
    Router.push("/expenses/add");
  };

  const search = () => {
    let start = document.getElementById("start").value;
    let end = document.getElementById("end").value;
    let type = document.getElementById("type").value;
    getExpenses({ start, end, type });
  };

  const renderHeader = () => {
    return (
      <div className="flex justify-content-end">
        <div className="flex justify-content-end">
          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText
              value={globalFilterValue}
              onChange={onGlobalFilterChange}
              placeholder="Keyword Search"
            />
          </span>
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
      </div>
    );
  };
  const header = renderHeader();

  const footerGroup = (
    <ColumnGroup>
      <Row>
        <Column
          footer="Totals:"
          colSpan={5}
          footerStyle={{ textAlign: "right" }}
        />
        <Column footer={totals[0]} />
        <Column />
        <Column />
        <Column />
        <Column />
        <Column />
      </Row>
    </ColumnGroup>
  );

  const typeBodyTemplate = (expense) => {
    return <Tag value={expense.type} severity={getSeverity(expense, 1)}></Tag>;
  };

  const statusBodyTemplate = (expense) => {
    return (
      <Tag value={expense.status} severity={getSeverity(expense, 2)}></Tag>
    );
  };

  const getSeverity = (expense, field) => {
    if (field === 1) {
      switch (expense.type) {
        case "Ingress":
          return "success";

        case "Egress":
          return "warning";

        default:
          return null;
      }
    } else if (field === 2) {
      switch (expense.status) {
        case "Completed":
          return "success";

        case "Pending":
          return "warning";

        default:
          return null;
      }
    }
  };

  const exportCSV = (selectionOnly) => {
    dt.current.exportCSV({ selectionOnly });
  };

  const confirmDeleteExpense = (expense) => {
    setExpense(expense);
    setDeleteExpenseDialog(true);
  };

  const hideDeleteExpenseDialog = () => {
    setDeleteExpenseDialog(false);
  };

  const deleteTicket = () => {
    //console.log("delete", ticket);
    expensesService.delete(expense.id).then(() => {
      setExpenses((expenses) => expenses.filter((x) => x.id !== expense.id));
      hideDeleteExpenseDialog();
    });
  };

  const deleteTicketDialogFooter = (
    <div>
      <Button
        label="No"
        icon="fa fa-times"
        className="p-button-text"
        onClick={hideDeleteExpenseDialog}
      />
      <Button
        label="Yes"
        icon="fa fa-check"
        className="p-button-text"
        onClick={deleteTicket}
      />
    </div>
  );

  const editExpense = (expense) => {
    window.open("/expenses/edit/" + expense.id, "_blank");
  };

  const actions = (e, expense) => {
    switch (parseInt(e?.value?.code)) {
      case 1:
        editExpense(expense);
        break;
      case 2:
        confirmDeleteExpense(expense);
        break;
      default:
        editExpense(expense);
        break;
    }
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <>
        <Dropdown
          onChange={(e) => actions(e, rowData)}
          options={[
            { name: "Edit", code: "1" },
            { name: "Delete", code: "2" },
          ]}
          optionLabel="name"
          placeholder="Actions"
        />
      </>
    );
  };

  const calculate = (data) => {
    //console.log(data);
    let ts = 0;
    for (let i = 0; i < data.length; i++) {
      let ttr = data[i].amount ? data[i].amount.replace("€ ", "") : 0;
      ts += parseFloat(ttr);
    }

    setTotals(["€ " + ts.toFixed(2)]);
  };

  return (
    <Layout>
      <div className="container">
        <div className="row">
          <div className="col-md-2">
            <label htmlFor="type">Type:</label>
            <div className="input-group">
              <select id="type" className="form-select">
                <option value="paymentDate">Payment Date</option>
              </select>
            </div>
          </div>
          <div className="col-md-4">
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
          <div className="col-md-4">
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
          value={expenses}
          paginator
          rows={25}
          dataKey="id"
          filters={filters}
          csvSeparator=";"
          globalFilterFields={filtersA}
          header={header}
          footerColumnGroup={footerGroup}
          emptyMessage="No expenses found."
        >
          <Column
            header="Actions"
            body={actionBodyTemplate}
            exportable={false}
          ></Column>
          <Column field="idP" header="Id" />
          <Column body={typeBodyTemplate} header="Type" />
          <Column field="title" sortable header="Title" />
          <Column field="paymentMethod" sortable header="Payment Method" />
          <Column field="amount" sortable header="Amount" />
          <Column field="paymentDate" sortable header="Payment Date" />
          <Column field="desc" sortable header="Desc" />
          <Column field="category" sortable header="Category" />
          <Column field="subcategory" sortable header="Sub Category" />
          <Column body={statusBodyTemplate} header="Status" />
          <Column field="status" sortable hidden header="Status" />
          <Column field="type" sortable hidden header="Type" />
        </DataTable>
      </div>
      <Dialog
        visible={deleteExpenseDialog}
        header="Confirm"
        modal
        footer={deleteTicketDialogFooter}
        onHide={hideDeleteExpenseDialog}
      >
        <div className="confirmation-content">
          <i className="fa fa-triangle mr-3" />
          {expense && (
            <span>
              Are you sure you want to delete <b>{expense.title}</b>?
            </span>
          )}
        </div>
      </Dialog>
    </Layout>
  );
}
