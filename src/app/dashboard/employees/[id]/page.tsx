import Link from "next/link";
import { notFound } from "next/navigation";
import { EMPLOYEES_BY_ID, TASKS } from "@/lib/mock-data";
import { MODULES, STATUSES } from "@/lib/modules";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardSubtitle, CardBody } from "@/components/ui/card";
import { ArrowLeft, FileDown } from "lucide-react";

export default async function EmployeePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const emp = EMPLOYEES_BY_ID[id];
  if (!emp) notFound();

  const mod = MODULES[emp.module];
  const mine = TASKS.filter((t) => t.assignee === id);
  const active = mine.filter((t) => t.status !== "finished");
  const finished = mine.filter((t) => t.status === "finished");
  const pipeline = active.reduce((a, t) => a + t.value, 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1200px] mx-auto space-y-6">
      <Link href="/dashboard/employees" className="inline-flex items-center gap-1 text-xs text-muted hover:text-ink transition">
        <ArrowLeft size={12} /> Back to all employees
      </Link>

      <div className="rounded-xl border border-border bg-surface p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1" style={{ background: `hsl(var(--${emp.module}))` }} />
        <div className="flex items-start gap-5 flex-wrap">
          <Avatar initials={emp.initials} name={emp.name} size="lg" tone={emp.module as any} className="!h-16 !w-16 !text-lg" />
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-3xl text-ink">{emp.name}</h1>
            <p className="text-sm text-muted mt-1">{emp.role}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge tone={emp.module as any}>{mod.label}</Badge>
              <Badge tone="gold">{emp.systemRole.replace("_", " ")}</Badge>
            </div>
          </div>
          <a href={`/api/export/employee/${emp.id}`} target="_blank" rel="noopener">
            <Button variant="outline" size="sm">
              <FileDown size={14} /> PDF Report
            </Button>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardBody className="text-center">
          <p className="text-3xl font-display text-ink tabular-nums">{active.length}</p>
          <p className="text-[10px] tracking-[0.2em] uppercase text-muted mt-1">Active Tasks</p>
        </CardBody></Card>
        <Card><CardBody className="text-center">
          <p className="text-3xl font-display text-ink tabular-nums">{finished.length}</p>
          <p className="text-[10px] tracking-[0.2em] uppercase text-muted mt-1">Finished</p>
        </CardBody></Card>
        <Card><CardBody className="text-center">
          <p className="text-3xl font-display text-gold tabular-nums">AED {(pipeline / 1_000_000).toFixed(2)}M</p>
          <p className="text-[10px] tracking-[0.2em] uppercase text-muted mt-1">Pipeline Value</p>
        </CardBody></Card>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Active Tasks</CardTitle>
            <CardSubtitle>Open and in-progress work</CardSubtitle>
          </div>
        </CardHeader>
        <CardBody className="space-y-2">
          {active.length === 0 && <p className="text-sm text-muted text-center py-6">No active tasks.</p>}
          {active.map((t) => {
            const s = STATUSES.find((x) => x.id === t.status)!;
            return (
              <div key={t.id} className="flex items-center gap-3 p-3 rounded-md border border-border hover:bg-surface-2 transition">
                <span className="font-mono text-[11px] text-gold w-16 shrink-0">{t.id}</span>
                <span className="text-sm text-ink flex-1">{t.title}</span>
                <span className="inline-flex items-center gap-1.5 text-xs shrink-0">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
                  {s.label}
                </span>
                {t.value > 0 && (
                  <span className="text-xs text-muted tabular-nums shrink-0">
                    AED {(t.value / 1000).toFixed(0)}K
                  </span>
                )}
              </div>
            );
          })}
        </CardBody>
      </Card>
    </div>
  );
}
