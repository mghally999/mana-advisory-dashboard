"use client";
import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, ArrowUpDown } from "lucide-react";
import { MODULES, STATUSES } from "@/lib/modules";
import type { Task, Employee, ModuleId, Status } from "@/lib/types";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/input";

type SortField = "id" | "title" | "module" | "assignee" | "status" | "priority" | "value" | "updated";

export function TasksTable({ tasks, employeesById }: { tasks: Task[]; employeesById: Record<string, Employee> }) {
  const [sort, setSort] = useState<SortField>("updated");
  const [dir, setDir] = useState<"asc" | "desc">("desc");
  const [moduleFilter, setModuleFilter] = useState<ModuleId | "all">("all");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");

  function toggle(field: SortField) {
    if (sort === field) setDir(dir === "asc" ? "desc" : "asc");
    else { setSort(field); setDir("desc"); }
  }

  const filtered = useMemo(() => {
    let out = tasks;
    if (moduleFilter !== "all") out = out.filter((t) => t.module === moduleFilter);
    if (statusFilter !== "all") out = out.filter((t) => t.status === statusFilter);
    return out;
  }, [tasks, moduleFilter, statusFilter]);

  const sorted = useMemo(() => {
    const s = [...filtered];
    s.sort((a, b) => {
      const av: any = a[sort], bv: any = b[sort];
      const cmp = av > bv ? 1 : av < bv ? -1 : 0;
      return dir === "asc" ? cmp : -cmp;
    });
    return s;
  }, [filtered, sort, dir]);

  function Th({ field, children, className = "" }: { field: SortField; children: React.ReactNode; className?: string }) {
    const active = sort === field;
    return (
      <th
        onClick={() => toggle(field)}
        className={`text-left text-[10px] tracking-[0.15em] uppercase text-muted py-3 px-3 cursor-pointer select-none hover:text-ink transition ${className}`}
      >
        <span className="flex items-center gap-1">
          {children}
          {active ? (dir === "asc" ? <ChevronUp size={11} /> : <ChevronDown size={11} />) : <ArrowUpDown size={10} className="opacity-40" />}
        </span>
      </th>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Select value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value as any)} className="w-auto max-w-[200px]">
          <option value="all">All modules</option>
          {Object.values(MODULES).map((m) => (
            <option key={m.id} value={m.id}>{m.label}</option>
          ))}
        </Select>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="w-auto max-w-[200px]">
          <option value="all">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </Select>
        <span className="ml-auto text-xs text-muted self-center">{sorted.length} of {tasks.length} tasks</span>
      </div>
      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="min-w-full text-sm">
          <thead className="bg-surface-2 border-b border-border">
            <tr>
              <Th field="id" className="w-24">ID</Th>
              <Th field="title">Title</Th>
              <Th field="module" className="w-32">Module</Th>
              <Th field="assignee" className="w-44">Assignee</Th>
              <Th field="status" className="w-28">Status</Th>
              <Th field="priority" className="w-24">Priority</Th>
              <Th field="value" className="w-32 text-right">Value</Th>
              <Th field="updated" className="w-28">Updated</Th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((t, i) => {
              const a = employeesById[t.assignee];
              const mod = MODULES[t.module];
              const status = STATUSES.find((s) => s.id === t.status)!;
              const days = Math.floor((Date.now() - t.updated) / 86_400_000);
              return (
                <tr key={t.id} className={`border-b border-border last:border-0 hover:bg-surface-2/60 transition ${i % 2 === 1 ? "bg-surface-2/30" : ""}`}>
                  <td className="px-3 py-2.5"><span className="font-mono text-[11px] text-gold">{t.id}</span></td>
                  <td className="px-3 py-2.5 text-ink">{t.title}</td>
                  <td className="px-3 py-2.5">
                    <span className="inline-flex items-center gap-1.5 text-xs">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: `hsl(var(--${t.module}))` }} />
                      {mod.label}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    {a ? (
                      <span className="flex items-center gap-2">
                        <Avatar initials={a.initials} name={a.name} size="sm" tone={a.module as any} />
                        <span className="text-xs text-ink truncate">{a.name}</span>
                      </span>
                    ) : <span className="text-xs text-muted">—</span>}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="inline-flex items-center gap-1.5 text-xs">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: status.color }} />
                      {status.label}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <Badge tone={t.priority === "high" ? "danger" : t.priority === "low" ? "default" : "gold"}>{t.priority}</Badge>
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums font-display text-ink">
                    {t.value > 0 ? `AED ${(t.value / 1_000).toFixed(0)}K` : "—"}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-muted">{days === 0 ? "today" : `${days}d ago`}</td>
                </tr>
              );
            })}
            {sorted.length === 0 && (
              <tr><td colSpan={8} className="text-center text-muted py-12 text-sm">No tasks match these filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
