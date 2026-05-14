"use client";
import { Card, CardHeader, CardTitle, CardSubtitle, CardBody } from "@/components/ui/card";
import { MODULES } from "@/lib/modules";
import { motion } from "framer-motion";
import type { Task } from "@/lib/types";
import type { ModuleId } from "@/lib/types";

export function ModuleBreakdown({ tasks }: { tasks: Task[] }) {
  const byModule: Record<ModuleId, { count: number; value: number }> = {
    marine: { count: 0, value: 0 },
    interior: { count: 0, value: 0 },
    mana: { count: 0, value: 0 },
    engineering: { count: 0, value: 0 },
  };
  for (const t of tasks) {
    byModule[t.module].count++;
    byModule[t.module].value += t.value;
  }
  const max = Math.max(...Object.values(byModule).map((m) => m.value), 1);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Pipeline by Module</CardTitle>
          <CardSubtitle>Total value across active and lead tasks</CardSubtitle>
        </div>
      </CardHeader>
      <CardBody className="space-y-4">
        {(Object.keys(byModule) as ModuleId[]).map((m, i) => {
          const mod = MODULES[m];
          const stats = byModule[m];
          const pct = (stats.value / max) * 100;
          return (
            <div key={m}>
              <div className="flex justify-between items-baseline mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: `hsl(var(--${m}))` }} />
                  <span className="text-sm text-ink font-medium">{mod.label}</span>
                  <span className="text-xs text-muted">· {stats.count} tasks</span>
                </div>
                <span className="text-sm font-display tabular-nums text-ink">
                  AED {(stats.value / 1_000_000).toFixed(2)}M
                </span>
              </div>
              <div className="h-2 rounded-full bg-surface-2 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, hsl(var(--${m})), hsl(var(--${m}) / 0.7))` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>
          );
        })}
      </CardBody>
    </Card>
  );
}
