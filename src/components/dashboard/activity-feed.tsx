"use client";
import { Card, CardHeader, CardTitle, CardSubtitle, CardBody } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import type { Employee } from "@/lib/types";
import { ArrowRight, MessageSquare, Plus, MoveRight } from "lucide-react";
import { motion } from "framer-motion";

interface Activity {
  id: string;
  ts: number;
  actor: string;
  taskId: string | null;
  kind: string;
  payload: any;
}

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function describe(a: Activity) {
  if (a.kind === "moved") return <>moved <strong className="text-ink">{a.taskId}</strong> from <em>{a.payload.from}</em> to <em>{a.payload.to}</em></>;
  if (a.kind === "commented") return <>commented on <strong className="text-ink">{a.taskId}</strong>: "{a.payload.text}"</>;
  if (a.kind === "created") return <>created <strong className="text-ink">{a.taskId}</strong></>;
  return <>updated <strong className="text-ink">{a.taskId}</strong></>;
}

function iconFor(kind: string) {
  if (kind === "moved") return MoveRight;
  if (kind === "commented") return MessageSquare;
  if (kind === "created") return Plus;
  return ArrowRight;
}

export function ActivityFeed({ activity, employeesById }: { activity: Activity[]; employeesById: Record<string, Employee> }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Activity</CardTitle>
          <CardSubtitle>Latest team movements</CardSubtitle>
        </div>
      </CardHeader>
      <CardBody className="space-y-3 max-h-80 overflow-auto scrollbar-thin">
        {activity.map((a, i) => {
          const actor = employeesById[a.actor];
          const Icon = iconFor(a.kind);
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              className="flex items-start gap-3"
            >
              <Avatar initials={actor?.initials ?? "?"} name={actor?.name} size="sm" tone={actor?.module as any} />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted">
                  <strong className="text-ink">{actor?.name ?? a.actor}</strong> {describe(a)}
                </p>
                <p className="text-[10px] text-soft mt-0.5 flex items-center gap-1">
                  <Icon size={10} />
                  {timeAgo(a.ts)}
                </p>
              </div>
            </motion.div>
          );
        })}
      </CardBody>
    </Card>
  );
}
