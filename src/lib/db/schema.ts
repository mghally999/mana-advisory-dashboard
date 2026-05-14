import { pgTable, text, timestamp, integer, boolean, bigint, primaryKey, jsonb, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// === Auth.js tables ===
export const users = pgTable("user", {
  id: text("id").primaryKey().notNull(),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  passwordHash: text("password_hash"),
  systemRole: text("system_role").$type<"super_admin" | "admin" | "manager" | "employee">().default("employee").notNull(),
  scopedModules: jsonb("scoped_modules").$type<string[]>(),
  module: text("module").notNull(),
  company: text("company").notNull(),
  initials: text("initials").notNull(),
  jobTitle: text("job_title"),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (acc) => ({ pk: primaryKey({ columns: [acc.provider, acc.providerAccountId] }) })
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

// === Domain tables ===
export const tasks = pgTable(
  "task",
  {
    id: text("id").primaryKey(), // Jira key, e.g. MAR-101
    title: text("title").notNull(),
    module: text("module").notNull(),
    company: text("company").notNull(),
    subcategory: text("subcategory").notNull(),
    assignee: text("assignee").notNull(),
    status: text("status").$type<"lead" | "todo" | "in_progress" | "finished">().notNull(),
    priority: text("priority").$type<"low" | "med" | "high">().default("med").notNull(),
    value: bigint("value", { mode: "number" }).default(0).notNull(),
    created: timestamp("created", { mode: "date" }).notNull(),
    updated: timestamp("updated", { mode: "date" }).notNull(),
    jiraRaw: jsonb("jira_raw"),
  },
  (t) => ({
    moduleStatus: index("idx_task_module_status").on(t.module, t.status),
    assignee: index("idx_task_assignee").on(t.assignee),
    updated: index("idx_task_updated").on(t.updated),
    activeStatus: index("idx_task_active").on(t.status).where(sql`status != 'finished'`),
  })
);

export const financialSnapshots = pgTable("financial_snapshot", {
  id: text("id").primaryKey(),
  asOf: timestamp("as_of", { mode: "date" }).notNull(),
  totalRevenue: bigint("total_revenue", { mode: "number" }).notNull(),
  totalCost: bigint("total_cost", { mode: "number" }).notNull(),
  netProfit: bigint("net_profit", { mode: "number" }).notNull(),
  netProfitOverridden: boolean("net_profit_overridden").default(false).notNull(),
  source: text("source").$type<"zoho" | "manual">().notNull(),
});

export const syncRuns = pgTable("sync_run", {
  id: text("id").primaryKey(),
  source: text("source").$type<"jira" | "zoho">().notNull(),
  startedAt: timestamp("started_at", { mode: "date" }).notNull(),
  finishedAt: timestamp("finished_at", { mode: "date" }),
  ok: boolean("ok"),
  itemsProcessed: integer("items_processed").default(0).notNull(),
  errorMessage: text("error_message"),
});

export const activityEvents = pgTable("activity_event", {
  id: text("id").primaryKey(),
  ts: timestamp("ts", { mode: "date" }).notNull(),
  actor: text("actor").notNull(),
  taskId: text("task_id"),
  kind: text("kind").notNull(),
  payload: jsonb("payload"),
});
