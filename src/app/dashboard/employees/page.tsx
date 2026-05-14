import Link from "next/link";
import { EMPLOYEES, TASKS } from "@/lib/mock-data";
import { MODULES } from "@/lib/modules";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function EmployeesPage() {
  const stats = new Map<string, { active: number; finished: number; value: number }>();
  for (const t of TASKS) {
    const s = stats.get(t.assignee) ?? { active: 0, finished: 0, value: 0 };
    if (t.status === "finished") s.finished++;
    else s.active++;
    s.value += t.value;
    stats.set(t.assignee, s);
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      <div>
        <p className="text-[10px] tracking-[0.2em] uppercase text-muted">Team</p>
        <h1 className="font-display text-3xl text-ink mt-1">All Employees</h1>
        <p className="text-sm text-muted mt-1">{EMPLOYEES.length} members across all verticals.</p>
      </div>
      <div className="gold-divider" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {EMPLOYEES.map((e) => {
          const s = stats.get(e.id) ?? { active: 0, finished: 0, value: 0 };
          const mod = MODULES[e.module];
          return (
            <Link
              key={e.id}
              href={`/dashboard/employees/${e.id}`}
              className="group rounded-xl border border-border bg-surface p-5 hover:border-gold/50 hover:shadow-lg transition relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1" style={{ background: `hsl(var(--${e.module}))` }} />
              <div className="flex items-start gap-4">
                <Avatar initials={e.initials} name={e.name} size="lg" tone={e.module as any} />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-ink truncate">{e.name}</p>
                  <p className="text-xs text-muted truncate">{e.role}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Badge tone={e.module as any}>{mod.label}</Badge>
                    {e.systemRole !== "employee" && (
                      <Badge tone="gold">{e.systemRole.replace("_", " ")}</Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-display text-ink tabular-nums">{s.active}</p>
                  <p className="text-[9px] tracking-wider uppercase text-muted">Active</p>
                </div>
                <div>
                  <p className="text-lg font-display text-ink tabular-nums">{s.finished}</p>
                  <p className="text-[9px] tracking-wider uppercase text-muted">Done</p>
                </div>
                <div>
                  <p className="text-lg font-display text-gold tabular-nums">
                    {s.value >= 1_000_000 ? `${(s.value / 1_000_000).toFixed(1)}M` : s.value >= 1000 ? `${(s.value / 1000).toFixed(0)}K` : "—"}
                  </p>
                  <p className="text-[9px] tracking-wider uppercase text-muted">Pipeline</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
