import { TASKS, EMPLOYEES_BY_ID } from "@/lib/mock-data";
import { auth } from "@/lib/auth";
import { getVisibleTasks } from "@/lib/permissions";
import { MODULES, STATUSES } from "@/lib/modules";
import type { Task, ModuleId } from "@/lib/types";
import { Avatar } from "@/components/ui/avatar";
import { isGuest } from "@/lib/guest";

export default async function ListPage() {
  let viewer = null;
  if (!(await isGuest())) {
    const session = await auth().catch(() => null);
    const id = (session?.user as any)?.id;
    viewer = id ? EMPLOYEES_BY_ID[id] ?? null : null;
  }
  const tasks = getVisibleTasks(TASKS, viewer);

  const byModule: Record<ModuleId, Task[]> = { marine: [], interior: [], mana: [], engineering: [] };
  for (const t of tasks) byModule[t.module].push(t);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      <div>
        <p className="text-[10px] tracking-[0.2em] uppercase text-muted">By Module</p>
        <h1 className="font-display text-3xl text-ink mt-1">Tasks Grouped by Vertical</h1>
      </div>
      <div className="gold-divider" />

      {(Object.keys(byModule) as ModuleId[]).map((m) => {
        const mod = MODULES[m];
        const mTasks = byModule[m];
        const total = mTasks.reduce((a, t) => a + t.value, 0);
        return (
          <section key={m} className="rounded-xl border border-border bg-surface overflow-hidden">
            <header className="p-4 border-b border-border bg-surface-2/40 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full" style={{ background: `hsl(var(--${m}))` }} />
                <h2 className="font-display text-xl text-ink">{mod.label}</h2>
                <span className="text-xs text-muted">· {mTasks.length} tasks</span>
              </div>
              <span className="text-xs text-gold font-display tabular-nums">
                AED {(total / 1_000_000).toFixed(2)}M
              </span>
            </header>
            <div className="divide-y divide-border">
              {STATUSES.map((s) => {
                const inStatus = mTasks.filter((t) => t.status === s.id);
                if (inStatus.length === 0) return null;
                return (
                  <div key={s.id} className="p-4">
                    <p className="text-[10px] tracking-[0.18em] uppercase text-muted mb-2">{s.label} ({inStatus.length})</p>
                    <div className="space-y-2">
                      {inStatus.map((t) => {
                        const a = EMPLOYEES_BY_ID[t.assignee];
                        return (
                          <div key={t.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-surface-2 transition">
                            <span className="font-mono text-[10px] text-gold w-16 shrink-0">{t.id}</span>
                            <span className="text-sm text-ink flex-1 truncate">{t.title}</span>
                            {a && <Avatar initials={a.initials} name={a.name} size="sm" tone={a.module as any} />}
                            {t.value > 0 && (
                              <span className="text-xs text-muted tabular-nums shrink-0">
                                AED {(t.value / 1000).toFixed(0)}K
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              {mTasks.length === 0 && (
                <p className="text-sm text-muted text-center py-8">No tasks in this module yet.</p>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
