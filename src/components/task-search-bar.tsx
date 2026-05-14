"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import Link from "next/link";
import { buildIndex, search } from "@/lib/search/task-search";
import { MODULES } from "@/lib/modules";
import type { Task, Employee } from "@/lib/types";

export function TaskSearchBar({ tasks, employeesById }: { tasks: Task[]; employeesById: Record<string, Employee> }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    buildIndex(tasks, employeesById);
  }, [tasks, employeesById]);

  const results = useMemo(() => (q.trim() ? search(q, 8) : []), [q]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-soft" />
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search tasks, IDs, assignees..."
          className="h-9 w-full pl-9 pr-9 rounded-md border border-border bg-surface text-sm text-ink placeholder:text-soft outline-none focus:border-gold focus:ring-2 focus:ring-gold/30"
        />
        {q && (
          <button onClick={() => { setQ(""); setOpen(false); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-soft hover:text-ink">
            <X size={14} />
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 rounded-md border border-border bg-surface shadow-xl overflow-hidden z-50">
          {results.map((t) => {
            const mod = MODULES[t.module];
            return (
              <Link
                key={t.id}
                href={`/dashboard/tasks?focus=${t.id}`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2 hover:bg-surface-2 transition"
              >
                <span className="font-mono text-[10px] text-gold w-14 shrink-0">{t.id}</span>
                <span className="text-sm text-ink truncate flex-1">{t.title}</span>
                <span
                  className="text-[10px] tracking-wide uppercase shrink-0 px-2 py-0.5 rounded-full"
                  style={{ background: `hsl(var(--${t.module}) / 0.1)`, color: `hsl(var(--${t.module}))` }}
                >
                  {mod.label}
                </span>
              </Link>
            );
          })}
        </div>
      )}

      {open && q && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 rounded-md border border-border bg-surface shadow-xl p-3 text-xs text-muted z-50">
          No tasks match &quot;{q}&quot;
        </div>
      )}
    </div>
  );
}
