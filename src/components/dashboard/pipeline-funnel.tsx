"use client";
import { Card, CardHeader, CardTitle, CardSubtitle, CardBody } from "@/components/ui/card";
import { STATUSES } from "@/lib/modules";
import { motion } from "framer-motion";
import type { Task } from "@/lib/types";

export function PipelineFunnel({ tasks }: { tasks: Task[] }) {
  const counts = STATUSES.map((s) => ({ ...s, count: tasks.filter((t) => t.status === s.id).length }));
  const total = counts.reduce((a, b) => a + b.count, 0) || 1;
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Pipeline</CardTitle>
          <CardSubtitle>{total} tasks across all stages</CardSubtitle>
        </div>
      </CardHeader>
      <CardBody>
        <div className="grid grid-cols-4 gap-3">
          {counts.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="text-center"
            >
              <div
                className="h-1.5 rounded-full mb-3"
                style={{ background: `hsl(var(--${c.id === "lead" ? "mana" : c.id === "todo" ? "marine" : c.id === "in_progress" ? "gold" : "engineering"}))` }}
              />
              <div className="text-4xl font-display font-medium text-ink tabular-nums">{c.count}</div>
              <div className="text-[10px] text-muted tracking-[0.18em] uppercase mt-1">{c.label}</div>
            </motion.div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
