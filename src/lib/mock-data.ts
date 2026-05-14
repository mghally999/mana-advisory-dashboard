import type { Employee, Task, RevenuePoint } from "@/lib/types";

/** All 17 employees from the actual business card scans. */
export const EMPLOYEES: Employee[] = [
  { id: "mm", name: "Mohammad Al Mazrooei", role: "Chairman & Managing Director", systemRole: "super_admin", company: "mana", module: "mana", initials: "MA" },
  { id: "nash", name: "Nash", role: "Group COO", systemRole: "super_admin", company: "mana", module: "mana", initials: "NA" },
  { id: "aaraiz", name: "Aaraiz Faisal", role: "BD Manager", systemRole: "manager", company: "kha", module: "marine", initials: "AF" },
  { id: "charles", name: "Charles Bas", role: "BD Manager", systemRole: "manager", company: "suofeiya", module: "interior", initials: "CB" },
  { id: "sunil", name: "Sunil Kumar", role: "Group Financial Manager", systemRole: "admin", company: "jupiter", module: "engineering", initials: "SK", scopedModules: ["interior", "marine", "mana", "engineering"] },
  { id: "dileep", name: "Dileep Menon", role: "Project Engineer", systemRole: "employee", company: "jupiter", module: "engineering", initials: "DM" },
  { id: "darlene", name: "Darlene", role: "Senior Designer", systemRole: "employee", company: "montaigne", module: "interior", initials: "DA" },
  { id: "ronissa", name: "Ronissa", role: "HR & Admin", systemRole: "employee", company: "kha", module: "marine", initials: "RO" },
  { id: "matar", name: "Matar", role: "Operations", systemRole: "employee", company: "kha", module: "marine", initials: "MT" },
  { id: "faisal", name: "Alfaisal Jahangeer", role: "Civil Engineer", systemRole: "employee", company: "jupiter", module: "engineering", initials: "AJ" },
  { id: "sofia", name: "Sofia", role: "Brand Lead — Suofeiya", systemRole: "employee", company: "suofeiya", module: "interior", initials: "SO" },
  { id: "ghally", name: "Mohammed Ghally", role: "Senior Software Engineer", systemRole: "admin", company: "mana", module: "mana", initials: "MG", scopedModules: ["mana"] },
  { id: "merlyn", name: "Merlyn Francis", role: "Software Engineer", systemRole: "employee", company: "mana", module: "mana", initials: "MF" },
  { id: "sana", name: "Sana Ullah", role: "Project Lead", systemRole: "manager", company: "kha", module: "marine", initials: "SU" },
  { id: "priya", name: "Priya", role: "Designer", systemRole: "employee", company: "buildtech", module: "interior", initials: "PR" },
  { id: "omar", name: "Omar", role: "Sales — DNAKE", systemRole: "employee", company: "dnake", module: "interior", initials: "OM" },
  { id: "rakesh", name: "Rakesh", role: "Site Engineer", systemRole: "employee", company: "jupiter", module: "engineering", initials: "RK" },
];

export const EMPLOYEES_BY_ID = Object.fromEntries(EMPLOYEES.map((e) => [e.id, e]));

const days = (d: number) => Date.now() - d * 86_400_000;

export const TASKS: Task[] = [
  // Marine
  { id: "MAR-101", title: "ADNOC marine tender — technical submission", module: "marine", company: "kha", subcategory: "Steel", assignee: "aaraiz", status: "in_progress", priority: "high", value: 2_400_000, created: days(12), updated: days(1) },
  { id: "MAR-102", title: "12m fiberglass — hull lamination batch", module: "marine", company: "kha", subcategory: "Fiberglass", assignee: "matar", status: "in_progress", priority: "med", value: 380_000, created: days(20), updated: days(2) },
  { id: "MAR-103", title: "Coast Guard fleet — survey & quote", module: "marine", company: "kha", subcategory: "Steel", assignee: "sana", status: "lead", priority: "high", value: 5_200_000, created: days(3), updated: days(1) },
  { id: "MAR-104", title: "Marine ops — Q2 hiring (2 fabricators)", module: "marine", company: "kha", subcategory: "Steel", assignee: "ronissa", status: "todo", priority: "low", value: 0, created: days(5), updated: days(2) },
  { id: "MAR-105", title: "Bayut yacht — gel coat refresh", module: "marine", company: "kha", subcategory: "Fiberglass", assignee: "matar", status: "finished", priority: "med", value: 95_000, created: days(40), updated: days(3) },
  // Interior
  { id: "INT-201", title: "Emaar villa cluster — 1,200 units design pkg", module: "interior", company: "montaigne", subcategory: "Montaigne Design", assignee: "darlene", status: "in_progress", priority: "high", value: 8_800_000, created: days(45), updated: days(8) },
  { id: "INT-202", title: "Suofeiya — Damac showroom fitout", module: "interior", company: "suofeiya", subcategory: "Suofeiya", assignee: "charles", status: "in_progress", priority: "high", value: 1_450_000, created: days(10), updated: days(2) },
  { id: "INT-203", title: "Buildtech — Marasi penthouse mood boards", module: "interior", company: "buildtech", subcategory: "Buildtech", assignee: "priya", status: "todo", priority: "med", value: 280_000, created: days(2), updated: days(2) },
  { id: "INT-204", title: "DNAKE — smart-home integration pitch", module: "interior", company: "dnake", subcategory: "DNAKE", assignee: "omar", status: "lead", priority: "med", value: 620_000, created: days(4), updated: days(1) },
  { id: "INT-205", title: "Suofeiya — Saadiyat villa kitchen", module: "interior", company: "suofeiya", subcategory: "Suofeiya", assignee: "sofia", status: "in_progress", priority: "med", value: 540_000, created: days(8), updated: days(2) },
  { id: "INT-206", title: "Montaigne — Burj Khalifa apt refurb", module: "interior", company: "montaigne", subcategory: "Montaigne Design", assignee: "darlene", status: "finished", priority: "high", value: 720_000, created: days(60), updated: days(7) },
  // Mana
  { id: "MAN-301", title: "Quarterly board pack — Q4 review", module: "mana", company: "mana", subcategory: "Back Office", assignee: "nash", status: "in_progress", priority: "high", value: 0, created: days(6), updated: days(1) },
  { id: "MAN-302", title: "Real estate — Marina tower acquisition memo", module: "mana", company: "mana", subcategory: "Real Estate", assignee: "mm", status: "lead", priority: "high", value: 18_000_000, created: days(2), updated: days(1) },
  { id: "MAN-303", title: "Consulting — Etihad ops review", module: "mana", company: "mana", subcategory: "Consulting", assignee: "charles", status: "in_progress", priority: "high", value: 1_100_000, created: days(11), updated: days(1) },
  { id: "MAN-304", title: "Mana dashboard — v1 launch", module: "mana", company: "mana", subcategory: "Back Office", assignee: "ghally", status: "in_progress", priority: "high", value: 0, created: days(14), updated: days(0) },
  { id: "MAN-305", title: "Group HR policy refresh", module: "mana", company: "mana", subcategory: "Back Office", assignee: "merlyn", status: "todo", priority: "low", value: 0, created: days(3), updated: days(3) },
  // Engineering
  { id: "ENG-401", title: "Jupiter — Aldar MEP package submission", module: "engineering", company: "jupiter", subcategory: "MEP", assignee: "dileep", status: "in_progress", priority: "high", value: 920_000, created: days(9), updated: days(2) },
  { id: "ENG-402", title: "Jupiter — Hudayriat civil survey", module: "engineering", company: "jupiter", subcategory: "Civil", assignee: "faisal", status: "in_progress", priority: "med", value: 410_000, created: days(15), updated: days(10) },
  { id: "ENG-403", title: "Structural sign-off — Yas mid-rise", module: "engineering", company: "jupiter", subcategory: "Structural", assignee: "rakesh", status: "todo", priority: "med", value: 230_000, created: days(4), updated: days(2) },
  { id: "ENG-404", title: "Jupiter — Q1 financial close", module: "engineering", company: "jupiter", subcategory: "MEP", assignee: "sunil", status: "finished", priority: "med", value: 0, created: days(50), updated: days(5) },
];

export const REVENUE_TREND: RevenuePoint[] = [
  { label: "Jun", revenue: 4_200_000, cost: 3_100_000 },
  { label: "Jul", revenue: 4_800_000, cost: 3_500_000 },
  { label: "Aug", revenue: 5_100_000, cost: 3_700_000 },
  { label: "Sep", revenue: 5_600_000, cost: 4_000_000 },
  { label: "Oct", revenue: 5_300_000, cost: 3_800_000 },
  { label: "Nov", revenue: 6_100_000, cost: 4_400_000 },
  { label: "Dec", revenue: 6_800_000, cost: 4_900_000 },
  { label: "Jan", revenue: 7_200_000, cost: 5_100_000 },
  { label: "Feb", revenue: 6_900_000, cost: 4_800_000 },
  { label: "Mar", revenue: 7_500_000, cost: 5_300_000 },
  { label: "Apr", revenue: 8_100_000, cost: 5_700_000 },
  { label: "May", revenue: 8_600_000, cost: 5_900_000 },
];

export const VERTICAL_REVENUE = [
  { module: "interior" as const, label: "Interior & Fitout", revenue: 28_400_000, color: "#b08838" },
  { module: "marine" as const, label: "Marine", revenue: 19_800_000, color: "#5a7da8" },
  { module: "engineering" as const, label: "Engineering", revenue: 14_200_000, color: "#5a7a3e" },
  { module: "mana" as const, label: "Mana (Consulting + RE)", revenue: 11_800_000, color: "#7a4f5e" },
];

export const FINANCIAL_SUMMARY = (() => {
  const latest = REVENUE_TREND[REVENUE_TREND.length - 1];
  const totalRevenue = latest.revenue;
  const totalCost = latest.cost;
  const netProfit = totalRevenue - totalCost;
  return {
    totalRevenue,
    totalCost,
    netProfit,
    netMargin: netProfit / totalRevenue,
    netProfitOverridden: false,
  };
})();

export const ACTIVITY = [
  { id: "a1", ts: Date.now() - 1 * 3_600_000, actor: "aaraiz", taskId: "MAR-101", kind: "moved", payload: { from: "todo", to: "in_progress" } },
  { id: "a2", ts: Date.now() - 3 * 3_600_000, actor: "darlene", taskId: "INT-201", kind: "commented", payload: { text: "Sent mood boards to client" } },
  { id: "a3", ts: Date.now() - 6 * 3_600_000, actor: "mm", taskId: "MAN-302", kind: "created", payload: {} },
  { id: "a4", ts: Date.now() - 9 * 3_600_000, actor: "dileep", taskId: "ENG-401", kind: "moved", payload: { from: "todo", to: "in_progress" } },
  { id: "a5", ts: Date.now() - 12 * 3_600_000, actor: "merlyn", taskId: "MAN-304", kind: "commented", payload: { text: "Pushed v1 of dashboard" } },
  { id: "a6", ts: Date.now() - 26 * 3_600_000, actor: "matar", taskId: "MAR-105", kind: "moved", payload: { from: "in_progress", to: "finished" } },
];
