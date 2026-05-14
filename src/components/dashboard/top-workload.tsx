"use client";
import { Card, CardHeader, CardTitle, CardSubtitle, CardBody } from "@/components/ui/card";
import { topK } from "@/lib/ds/min-heap";
import type { Task, Employee } from "@/lib/types";
import { Avatar } from "@/components/ui/avatar";
import Link from "next/link";

export function TopWorkload({ tasks, employees }: { tasks: Task[]; employees: Employee[] }) {
  const counts = new Map<string, number>();
  const values = new Map<string, number>();
  for (const t of tasks) {
    if (t.status === "finished") continue;
    counts.set(t.assignee, (counts.get(t.assignee) ?? 0) + 1);
    values.set(t.assignee, (values.get(t.assignee) ?? 0) + t.value);
  }
  const rows = Array.from(counts.entries()).map(([id, count]) => {
    const emp = employees.find((e) => e.id === id);
    return { id, name: emp?.name ?? id, initials: emp?.initials ?? "?", module: emp?.module ?? "mana", count, value: values.get(id) ?? 0 };
  });
  // top-K via min-heap: O(n log k)
  const top = topK(rows, 6, (a, b) => a.count - b.count);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Top Workload</CardTitle>
          <CardSubtitle>Most active assignees right now</CardSubtitle>
        </div>
      </CardHeader>
      <CardBody className="space-y-2">
        {top.map((r) => (
          <Link
            key={r.id}
            href={`/dashboard/employees/${r.id}`}
            className="flex items-center gap-3 p-2 rounded-md hover:bg-surface-2 transition border border-transparent hover:border-border"
          >
            <Avatar initials={r.initials} name={r.name} size="sm" tone={r.module as any} />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-ink truncate">{r.name}</p>
              <p className="text-[10px] text-muted">{r.count} active tasks</p>
            </div>
            <p className="text-xs text-gold font-display tabular-nums shrink-0">
              {r.value >= 1_000_000 ? `${(r.value / 1_000_000).toFixed(1)}M` : r.value >= 1000 ? `${(r.value / 1000).toFixed(0)}K` : "—"}
            </p>
          </Link>
        ))}
      </CardBody>
    </Card>
  );
}
