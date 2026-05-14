/**
 * Excel export — multi-sheet workbook for tasks, employees, financials, revenue.
 * Uses SheetJS (xlsx). Returns a Buffer.
 */
import * as XLSX from "xlsx";
import type { Task, Employee, RevenuePoint } from "@/lib/types";
import { MODULES } from "@/lib/modules";

export interface ExcelInput {
  tasks: Task[];
  employees: Employee[];
  financials: {
    totalRevenue: number;
    totalCost: number;
    netProfit: number;
    netMargin: number;
  };
  revenueTrend: RevenuePoint[];
  asOf: Date;
}

export function buildWorkbook(input: ExcelInput): Buffer {
  const wb = XLSX.utils.book_new();

  // === Tasks sheet ===
  const taskRows = input.tasks.map((t) => {
    const a = input.employees.find((e) => e.id === t.assignee);
    return {
      "Ticket ID": t.id,
      Title: t.title,
      Module: MODULES[t.module]?.label ?? t.module,
      Company: t.company,
      Subcategory: t.subcategory,
      Assignee: a?.name ?? t.assignee,
      Status: t.status,
      Priority: t.priority,
      "Value (AED)": t.value,
      Created: new Date(t.created).toISOString(),
      Updated: new Date(t.updated).toISOString(),
    };
  });
  const wsTasks = XLSX.utils.json_to_sheet(taskRows);
  setColumnWidths(wsTasks, [12, 50, 18, 14, 16, 22, 14, 10, 14, 22, 22]);
  XLSX.utils.book_append_sheet(wb, wsTasks, "Tasks");

  // === Employees sheet ===
  const empRows = input.employees.map((e) => ({
    ID: e.id,
    Name: e.name,
    Title: e.role,
    "System Role": e.systemRole,
    Module: MODULES[e.module]?.label ?? e.module,
    Company: e.company,
  }));
  const wsEmp = XLSX.utils.json_to_sheet(empRows);
  setColumnWidths(wsEmp, [10, 24, 30, 14, 18, 14]);
  XLSX.utils.book_append_sheet(wb, wsEmp, "Employees");

  // === Financials sheet ===
  const f = input.financials;
  const finRows = [
    { Metric: "Total Revenue (AED)", Value: f.totalRevenue },
    { Metric: "Total Cost (AED)", Value: f.totalCost },
    { Metric: "Net Profit (AED)", Value: f.netProfit },
    { Metric: "Net Margin", Value: `${(f.netMargin * 100).toFixed(2)}%` },
    { Metric: "As of", Value: input.asOf.toISOString() },
  ];
  const wsFin = XLSX.utils.json_to_sheet(finRows);
  setColumnWidths(wsFin, [28, 22]);
  XLSX.utils.book_append_sheet(wb, wsFin, "Financials");

  // === Revenue trend sheet ===
  const revRows = input.revenueTrend.map((r) => ({
    Month: r.label,
    "Revenue (AED)": r.revenue,
    "Cost (AED)": r.cost,
    "Net (AED)": r.revenue - r.cost,
  }));
  const wsRev = XLSX.utils.json_to_sheet(revRows);
  setColumnWidths(wsRev, [12, 16, 14, 14]);
  XLSX.utils.book_append_sheet(wb, wsRev, "Revenue Trend");

  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
}

function setColumnWidths(ws: XLSX.WorkSheet, widths: number[]) {
  ws["!cols"] = widths.map((w) => ({ wch: w }));
}
