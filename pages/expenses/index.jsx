import { Layout } from "components/expenses";
import React, { useState, useEffect } from "react";
import Router from "next/router";
import { formatDate, expensesService } from "../../services";
import {
  Paper, Typography, Box, Stack, IconButton, Tooltip, Chip, Button, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from '@mui/icons-material/Download';
import InfoIcon from "@mui/icons-material/Info";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState(null);
  const [expense, setExpense] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dates, setDates] = useState({ start: "", end: "", type: "paymentDate" });
  const [totals, setTotals] = useState([0]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [searchField, setSearchField] = useState("all");
  const [globalSearch, setGlobalSearch] = useState("");

  useEffect(() => {
    getExpenses();
  }, []);

  useEffect(() => {
    if (!expenses) return;
    let filtered = [...expenses];
    if (globalSearch && searchField !== "all") {
      filtered = filtered.filter(exp => (exp[searchField] || "").toString().toLowerCase().includes(globalSearch.toLowerCase()));
    } else if (globalSearch && searchField === "all") {
      filtered = filtered.filter(exp => [
        "title", "desc", "category", "subcategory", "type", "paymentMethod", "amount", "paymentDate", "status"
      ].some(field => (exp[field] || "").toString().toLowerCase().includes(globalSearch.toLowerCase())));
    }
    setFilteredExpenses(filtered);
    setPage(0);
    calculate(filtered);
  }, [globalSearch, searchField, expenses]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);

  const getExpenses = (customDates = null) => {
    setLoading(true);
    let start = new Date();
    start.setDate(1);
    start = formatDate(start);
    let end = formatDate(new Date());
    let type = "paymentDate";
    if (customDates) {
      start = customDates.start;
      end = customDates.end;
      type = customDates.type;
    } else {
      setDates({ start, end, type });
    }
    expensesService.getAll({ start, end, type }).then(res => {
      setExpenses(res);
      setFilteredExpenses(res);
      calculate(res);
      setLoading(false);
    });
  };

  const search = () => {
    let start = document.getElementById("start").value;
    let end = document.getElementById("end").value;
    let type = document.getElementById("type").value;
    getExpenses({ start, end, type });
  };

  const addNew = () => {
    Router.push("/expenses/add");
  };

  const editExpense = (expense) => {
    Router.push(`/expenses/edit/${expense.id}`);
  };

  const confirmDeleteExpense = (exp) => {
    setExpense(exp);
    setDeleteDialog(true);
  };

  const deleteExpense = () => {
    expensesService.delete(expense.id).then(() => {
      setExpenses((exps) => exps.filter((x) => x.id !== expense.id));
      setDeleteDialog(false);
    });
  };

  const exportCSV = () => {
    if (!filteredExpenses.length) return;
    const fields = ["type", "title", "paymentMethod", "amount", "paymentDate", "desc", "category", "subcategory", "status"];
    const csvRows = [
      fields.join(","),
      ...filteredExpenses.map(row =>
        fields.map(field => JSON.stringify(row[field] ?? "")).join(",")
      ),
    ];
    const csvData = csvRows.join("\n");
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'expenses_export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const pageExpenses = filteredExpenses.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const totalPages = Math.ceil(filteredExpenses.length / rowsPerPage);

  const calculate = (data) => {
    let ts = 0;
    for (let i = 0; i < data.length; i++) {
      let ttr = data[i].amount ? data[i].amount.replace("€ ", "") : 0;
      ts += parseFloat(ttr);
    }
    setTotals(["€ " + ts.toFixed(2)]);
  };

  return (
    <Layout>
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'end', width: '100%' }}>
          <Box sx={{ minWidth: 140 }}>
            <Typography fontWeight={500} sx={{ mb: 1 }}>Type:</Typography>
            <select id="type" className="form-select" value={dates.type} onChange={e => setDates(d => ({ ...d, type: e.target.value }))} style={{ width: '100%', minWidth: '120px' }} >
              <option value="paymentDate">Payment Date</option>
            </select>
          </Box>
          <Box sx={{ minWidth: 140, flex: 1 }}>
            <Typography fontWeight={500} sx={{ mb: 1 }}>From Date:</Typography>
            <input type="date" className="form-control" id="start" value={dates.start || ''} onChange={e => setDates(d => ({ ...d, start: e.target.value }))} placeholder="From" style={{ width: '100%' }} />
          </Box>
          <Box sx={{ minWidth: 140, flex: 1 }}>
            <Typography fontWeight={500} sx={{ mb: 1 }}>To Date:</Typography>
            <input type="date" className="form-control" id="end" value={dates.end || ''} onChange={e => setDates(d => ({ ...d, end: e.target.value }))} placeholder="To" style={{ width: '100%' }} />
          </Box>
          <Box sx={{ minWidth: 180, flex: 2 }}>
            <Typography fontWeight={500} sx={{ mb: 1 }}>Search</Typography>
            <input type="text" className="form-control" placeholder="Enter search keyword" style={{ width: '100%' }} onChange={e => setGlobalSearch(e.target.value)} />
          </Box>
          <Box sx={{ minWidth: 120, alignSelf: 'flex-end' }}>
            <Button variant="contained" color="primary" fullWidth onClick={search} sx={{ height: 50 }} startIcon={<InfoIcon />}>Search</Button>
          </Box>
        </Box>
      </Paper>
      <Paper elevation={1} style={{ margin: "10px 0 20px 0", padding: "16px", background: "#f5f5f5", display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
        <Typography color="black">Expenses: {filteredExpenses.length}</Typography>
        <Typography color="black">Total: {totals[0]}</Typography>
        <Box sx={{ display:'flex', gap:1 }}>
          <Tooltip title="Export Excel">
            <IconButton color="success" onClick={exportCSV}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Add Expense">
            <IconButton color="primary" onClick={addNew}>
              <AddIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>
      <Box sx={{ width: '100%', minHeight: 200, position: 'relative' }}>
        {loading && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, width: '100%' }}>
            <CircularProgress color="primary" />
            <Typography variant="body1" color="primary" sx={{ mt: 1 }}>Loading expenses...</Typography>
          </Box>
        )}
        {!loading && pageExpenses.length === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, width: '100%' }}>
            <InfoIcon sx={{ color: 'info.main', fontSize: 48, mb: 1 }} />
            <Typography variant="h6" color="text.secondary">No expenses found</Typography>
          </Box>
        )}
        {!loading && pageExpenses.map(exp => (
          <Paper key={exp.id} elevation={2} sx={{ width: '100%', minHeight: 66, display: 'flex', alignItems: 'center', boxSizing: 'border-box', p: 1.5, mb: 1, borderRadius: 1, overflow: 'hidden' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <Stack direction="row" flexWrap="wrap" spacing={2} alignItems="center" sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                <Tooltip title={exp.type}><Chip label={exp.type} color={exp.type === 'Ingress' ? 'success' : (exp.type === 'Egress' ? 'warning' : 'default')} variant="outlined" sx={{ minWidth: 80, maxWidth: 100 }} /></Tooltip>
                <Tooltip title={exp.title}><Chip label={exp.title.length > 16 ? exp.title.slice(0, 16) + '…' : exp.title} color="primary" variant="outlined" sx={{ minWidth: 100, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis' }} /></Tooltip>
                <Tooltip title={exp.paymentMethod}><Chip label={exp.paymentMethod} sx={{ minWidth: 90, maxWidth: 120 }} /></Tooltip>
                <Typography sx={{ minWidth: 75 }}>{exp.amount}</Typography>
                <Typography sx={{ minWidth: 110 }}>{exp.paymentDate}</Typography>
                <Tooltip title={exp.desc}><Chip label={exp.desc && exp.desc.length > 12 ? exp.desc.slice(0, 12) + '…' : exp.desc} sx={{ minWidth: 80, maxWidth: 120 }} /></Tooltip>
                <Tooltip title={exp.category}><Chip label={exp.category} sx={{ minWidth: 80, maxWidth: 120 }} /></Tooltip>
                <Tooltip title={exp.subcategory}><Chip label={exp.subcategory} sx={{ minWidth: 80, maxWidth: 120 }} /></Tooltip>
                <Tooltip title={exp.status}><Chip label={exp.status} color={exp.status === 'Completed' ? 'success' : 'warning'} sx={{ minWidth: 95, maxWidth: 120 }} /></Tooltip>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Tooltip title="Edit Expense">
                  <IconButton onClick={() => editExpense(exp)}><EditIcon color="primary" /></IconButton>
                </Tooltip>
                <Tooltip title="Delete Expense">
                  <IconButton onClick={() => confirmDeleteExpense(exp)} color="secondary"><DeleteIcon /></IconButton>
                </Tooltip>
              </Stack>
            </Box>
          </Paper>
        ))}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', my: 3, gap: 3 }}>
        <Typography sx={{ mr: 1 }}>Rows per page:</Typography>
        <select
          value={rowsPerPage}
          onChange={e => {
            setRowsPerPage(Number(e.target.value));
            setPage(0);
          }}
          style={{ height: 28, marginRight: 16 }}
        >
          {[25, 50, 100, 200, 500].map(n => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <Typography variant="body2" color="text.secondary" sx={{ minWidth: 56, textAlign: 'center' }}>{pageExpenses.length} expenses</Typography>
        <Button variant="outlined" size="small" disabled={page === 0} onClick={() => setPage(page - 1)}>Prev</Button>
        <Typography variant="body2" sx={{ lineHeight: 2.5 }}>Page {page + 1} of {totalPages}</Typography>
        <Button variant="outlined" size="small" disabled={page + 1 >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
      </Box>
      {/* Delete dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Confirm</DialogTitle>
        <DialogContent>
          {expense && <Typography>Are you sure you want to delete <b>{expense.title}</b>?</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>No</Button>
          <Button color="error" onClick={deleteExpense}>Yes</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
