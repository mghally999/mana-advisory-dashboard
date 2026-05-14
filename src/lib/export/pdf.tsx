/**
 * PDF export — branded executive report.
 * Uses @react-pdf/renderer. Returns a Buffer-compatible stream.
 */
import React from "react";
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import type { Task, Employee, RevenuePoint } from "@/lib/types";
import { MODULES } from "@/lib/modules";

// Pearl & Champagne palette (light mode)
const COLORS = {
  bg: "#FAF7F2",
  card: "#FFFFFF",
  ink: "#2C2620",
  muted: "#7A6F60",
  gold: "#B08838",
  border: "#E9E1D2",
  marine: "#5A7DA8",
  interior: "#B08838",
  mana: "#7A4F5E",
  engineering: "#5A7A3E",
};

const styles = StyleSheet.create({
  page: { padding: 40, backgroundColor: COLORS.bg, color: COLORS.ink, fontSize: 10, fontFamily: "Helvetica" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20, borderBottomWidth: 2, borderBottomColor: COLORS.gold, paddingBottom: 12 },
  brand: { fontSize: 22, color: COLORS.gold, fontFamily: "Helvetica-Bold", letterSpacing: 4 },
  subtitle: { color: COLORS.muted, fontSize: 8, letterSpacing: 2, marginTop: 2 },
  date: { color: COLORS.muted, fontSize: 9 },
  h2: { fontSize: 13, color: COLORS.gold, fontFamily: "Helvetica-Bold", marginTop: 18, marginBottom: 8, letterSpacing: 1 },
  kpiRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
  kpiCard: { flex: 1, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, borderRadius: 6, padding: 12 },
  kpiLabel: { color: COLORS.muted, fontSize: 8, letterSpacing: 1.5, textTransform: "uppercase" },
  kpiValue: { fontSize: 18, fontFamily: "Helvetica-Bold", marginTop: 4, color: COLORS.ink },
  tableHead: { flexDirection: "row", backgroundColor: COLORS.gold, color: "#FFF", padding: 6, fontFamily: "Helvetica-Bold", fontSize: 9 },
  tableRow: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: COLORS.border, padding: 6 },
  tableRowAlt: { backgroundColor: "#F4EFE6" },
  c1: { width: "12%" },
  c2: { width: "38%" },
  c3: { width: "14%" },
  c4: { width: "16%" },
  c5: { width: "10%" },
  c6: { width: "10%", textAlign: "right" },
  footer: { position: "absolute", bottom: 24, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", color: COLORS.muted, fontSize: 8, borderTopWidth: 0.5, borderTopColor: COLORS.border, paddingTop: 6 },
  pill: { fontSize: 7, padding: 2, borderRadius: 3, color: "#FFF", textAlign: "center" },
});

export interface PdfInput {
  title: string;
  asOf: Date;
  tasks: Task[];
  employees: Employee[];
  financials: { totalRevenue: number; totalCost: number; netProfit: number; netMargin: number };
  revenueTrend: RevenuePoint[];
}

function fmt(n: number) {
  if (Math.abs(n) >= 1_000_000) return `AED ${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `AED ${(n / 1_000).toFixed(0)}K`;
  return `AED ${n.toLocaleString()}`;
}

function statusColor(s: string) {
  return s === "in_progress" ? COLORS.gold : s === "finished" ? COLORS.engineering : s === "lead" ? COLORS.muted : COLORS.marine;
}

function moduleColor(m: string) {
  return (COLORS as any)[m] ?? COLORS.muted;
}

export const ExecutiveReport: React.FC<PdfInput> = ({ title, asOf, tasks, employees, financials }) => {
  const empById = Object.fromEntries(employees.map((e) => [e.id, e]));
  const active = tasks.filter((t) => t.status !== "finished").slice(0, 30);

  return React.createElement(
    Document,
    {},
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      // Header
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(
          View,
          {},
          React.createElement(Text, { style: styles.brand }, "MANA"),
          React.createElement(Text, { style: styles.subtitle }, "ADVISORY GROUP")
        ),
        React.createElement(
          View,
          { style: { alignItems: "flex-end" } },
          React.createElement(Text, { style: { fontSize: 11, fontFamily: "Helvetica-Bold" } }, title),
          React.createElement(Text, { style: styles.date }, asOf.toLocaleString("en-GB"))
        )
      ),
      // KPIs
      React.createElement(Text, { style: styles.h2 }, "EXECUTIVE SUMMARY"),
      React.createElement(
        View,
        { style: styles.kpiRow },
        kpi("TOTAL REVENUE", fmt(financials.totalRevenue)),
        kpi("TOTAL COST", fmt(financials.totalCost)),
        kpi("NET PROFIT", fmt(financials.netProfit)),
        kpi("NET MARGIN", `${(financials.netMargin * 100).toFixed(1)}%`)
      ),
      // Active tasks table
      React.createElement(Text, { style: styles.h2 }, `ACTIVE TASKS (${active.length})`),
      React.createElement(
        View,
        { style: styles.tableHead },
        React.createElement(Text, { style: styles.c1 }, "ID"),
        React.createElement(Text, { style: styles.c2 }, "Title"),
        React.createElement(Text, { style: styles.c3 }, "Module"),
        React.createElement(Text, { style: styles.c4 }, "Assignee"),
        React.createElement(Text, { style: styles.c5 }, "Status"),
        React.createElement(Text, { style: styles.c6 }, "Value")
      ),
      ...active.map((t, i) =>
        React.createElement(
          View,
          { key: t.id, style: [styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}] },
          React.createElement(Text, { style: [styles.c1, { color: moduleColor(t.module), fontFamily: "Helvetica-Bold" }] }, t.id),
          React.createElement(Text, { style: styles.c2 }, t.title),
          React.createElement(Text, { style: styles.c3 }, MODULES[t.module]?.label ?? t.module),
          React.createElement(Text, { style: styles.c4 }, empById[t.assignee]?.name ?? t.assignee),
          React.createElement(Text, { style: [styles.c5, { color: statusColor(t.status), fontFamily: "Helvetica-Bold" }] }, t.status),
          React.createElement(Text, { style: styles.c6 }, t.value ? fmt(t.value) : "—")
        )
      ),
      // Footer
      React.createElement(
        View,
        { style: styles.footer },
        React.createElement(Text, {}, "MANA ADVISORY — CONFIDENTIAL"),
        React.createElement(Text, {}, `Generated ${asOf.toLocaleDateString("en-GB")}`)
      )
    )
  );
};

function kpi(label: string, value: string) {
  return React.createElement(
    View,
    { style: styles.kpiCard },
    React.createElement(Text, { style: styles.kpiLabel }, label),
    React.createElement(Text, { style: styles.kpiValue }, value)
  );
}

export async function renderExecutivePdf(input: PdfInput): Promise<Buffer> {
  return await renderToBuffer(React.createElement(ExecutiveReport, input));
}
