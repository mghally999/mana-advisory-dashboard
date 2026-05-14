"use client";
import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { STATUSES, MODULES } from "@/lib/modules";
import type { Task, Status, Employee } from "@/lib/types";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { GripVertical } from "lucide-react";

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n ? `${n}` : "";
}

function TaskCard({ task, employees }: { task: Task; employees: Record<string, Employee> }) {
  const assignee = employees[task.assignee];
  const mod = MODULES[task.module];
  return (
    <div className="p-3 rounded-md bg-surface border border-border hover:border-gold/50 hover:shadow-md transition cursor-grab active:cursor-grabbing">
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="font-mono text-[10px] text-gold tracking-wide">{task.id}</span>
        <Badge tone={task.priority === "high" ? "danger" : task.priority === "low" ? "default" : "gold"}>{task.priority}</Badge>
      </div>
      <p className="text-sm text-ink mb-2 line-clamp-2">{task.title}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] text-muted">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: `hsl(var(--${task.module}))` }} />
          <span>{mod.label}</span>
          {task.value > 0 && (
            <>
              <span>·</span>
              <span className="text-gold tabular-nums">AED {fmt(task.value)}</span>
            </>
          )}
        </div>
        {assignee && <Avatar initials={assignee.initials} name={assignee.name} size="sm" tone={assignee.module as any} />}
      </div>
    </div>
  );
}

function DraggableCard({ task, employees }: { task: Task; employees: Record<string, Employee> }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.4 : 1 }}
      {...attributes}
      {...listeners}
    >
      <TaskCard task={task} employees={employees} />
    </div>
  );
}

function Column({ status, tasks, employees }: { status: typeof STATUSES[number]; tasks: Task[]; employees: Record<string, Employee> }) {
  const { isOver, setNodeRef } = useDroppable({ id: status.id });
  const total = tasks.reduce((a, t) => a + t.value, 0);
  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl border min-w-[280px] flex flex-col transition ${
        isOver ? "border-gold bg-gold-bg/30" : "border-border bg-surface-2/40"
      }`}
    >
      <div className="p-3 border-b border-border flex items-center justify-between sticky top-0 bg-surface/80 backdrop-blur-sm rounded-t-xl">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: status.color }} />
          <h3 className="text-sm font-medium text-ink">{status.label}</h3>
          <span className="text-[10px] text-muted">({tasks.length})</span>
        </div>
        {total > 0 && <span className="text-[10px] text-gold tabular-nums font-display">AED {fmt(total)}</span>}
      </div>
      <div className="p-3 space-y-2 flex-1 min-h-[60vh]">
        {tasks.map((t) => (
          <DraggableCard key={t.id} task={t} employees={employees} />
        ))}
        {tasks.length === 0 && (
          <p className="text-[10px] text-soft text-center py-4 italic">drop tasks here</p>
        )}
      </div>
    </div>
  );
}

export function KanbanBoard({ initialTasks, employees }: { initialTasks: Task[]; employees: Record<string, Employee> }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const grouped: Record<Status, Task[]> = { lead: [], todo: [], in_progress: [], finished: [] };
  for (const t of tasks) grouped[t.status].push(t);
  const active = tasks.find((t) => t.id === activeId);

  function onDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  async function onDragEnd(e: DragEndEvent) {
    setActiveId(null);
    if (!e.over) return;
    const taskId = String(e.active.id);
    const newStatus = e.over.id as Status;
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    // Optimistic update
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus, updated: Date.now() } : t)));

    // Persist (Jira write-back via API; in guest mode this is a no-op)
    try {
      await fetch("/api/tasks/move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, newStatus }),
      });
    } catch {
      // rollback on failure
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: task.status } : t)));
    }
  }

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
        {STATUSES.map((s) => (
          <motion.div key={s.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex-1">
            <Column status={s} tasks={grouped[s.id]} employees={employees} />
          </motion.div>
        ))}
      </div>
      <DragOverlay>
        {active && (
          <div className="rotate-2 shadow-2xl">
            <TaskCard task={active} employees={employees} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
