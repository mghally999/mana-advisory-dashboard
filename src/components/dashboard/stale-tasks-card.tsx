"use client";
import { AlertTriangle, Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardSubtitle, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getStaleTasks, daysIdle } from "@/lib/tasks/stale-detector";
import { MODULES } from "@/lib/modules";
import type { Task, Employee } from "@/lib/types";
import Link from "next/link";

export function StaleTasksCard({ tasks, employeesById }: { tasks: Task[]; employeesById: Record<string, Employee> }) {
  const stale = getStaleTasks(tasks);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-warn" />
            Management Review
          </CardTitle>
          <CardSubtitle>Tasks in progress for 7+ days</CardSubtitle>
        </div>
        <Badge tone={stale.length > 0 ? "warn" : "success"}>{stale.length}</Badge>
      </CardHeader>
      <CardBody className="space-y-2 max-h-80 overflow-auto scrollbar-thin">
        {stale.length === 0 && (
          <p className="text-sm text-muted text-center py-6">All in-progress tasks are fresh ✨</p>
        )}
        {stale.slice(0, 8).map((t) => {
          const assignee = employeesById[t.assignee];
          return (
            <Link
              key={t.id}
              href={`/dashboard/tasks?focus=${t.id}`}
              className="flex items-center gap-3 p-2 rounded-md hover:bg-surface-2 transition border border-transparent hover:border-border"
            >
              <div className="h-8 w-1 rounded-full" style={{ background: `hsl(var(--${t.module}))` }} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-gold">{t.id}</span>
                  <span className="text-xs text-ink truncate">{t.title}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted">
                  <span>{assignee?.name ?? t.assignee}</span>
                  <span>·</span>
                  <span>{MODULES[t.module].label}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-warn shrink-0">
                <Clock size={10} />
                {daysIdle(t)}d
              </div>
            </Link>
          );
        })}
      </CardBody>
    </Card>
  );
}
