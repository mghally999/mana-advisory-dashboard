export type ModuleId = "marine" | "interior" | "mana" | "engineering";
export type Status = "lead" | "todo" | "in_progress" | "finished";
export type Priority = "low" | "med" | "high";
export type Role = "super_admin" | "admin" | "manager" | "employee";

export interface Module {
  id: ModuleId;
  label: string;
  color: string;
  companies: { id: string; label: string }[];
  subcategoryLabel: string;
  subcategories?: string[];
}

export interface Employee {
  id: string;
  name: string;
  role: string; // job title (free text)
  systemRole: Role;
  company: string;
  module: ModuleId;
  initials: string;
  email?: string;
  scopedModules?: ModuleId[]; // for "admin" role
}

export interface Task {
  id: string; // e.g. "MAR-101"
  title: string;
  module: ModuleId;
  company: string;
  subcategory: string;
  assignee: string; // Employee.id
  status: Status;
  priority: Priority;
  value: number; // AED
  created: number;
  updated: number;
}

export interface FinancialSnapshot {
  asOf: number;
  totalRevenue: number;
  totalCost: number;
  netProfit: number;
  netProfitOverridden: boolean; // true if MM entered it manually
}

export interface RevenuePoint { label: string; revenue: number; cost: number; }
