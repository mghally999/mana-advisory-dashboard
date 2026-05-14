import { TASKS, EMPLOYEES_BY_ID } from "@/lib/mock-data";
import { auth } from "@/lib/auth";
import { getVisibleTasks } from "@/lib/permissions";
import { KanbanBoard } from "@/components/kanban-board";
import { TaskSearchBar } from "@/components/task-search-bar";
import { isGuest } from "@/lib/guest";

export default async function KanbanPage() {
  let viewer = null;
  if (!(await isGuest())) {
    const session = await auth().catch(() => null);
    const id = (session?.user as any)?.id;
    viewer = id ? EMPLOYEES_BY_ID[id] ?? null : null;
  }
  const tasks = getVisibleTasks(TASKS, viewer);
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-5">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="text-[10px] tracking-[0.2em] uppercase text-muted">Kanban</p>
          <h1 className="font-display text-3xl text-ink mt-1">Active Pipeline</h1>
          <p className="text-sm text-muted mt-1">Drag tasks between columns — changes sync to Jira.</p>
        </div>
        <TaskSearchBar tasks={tasks} employeesById={EMPLOYEES_BY_ID} />
      </div>
      <div className="gold-divider" />
      <KanbanBoard initialTasks={tasks} employees={EMPLOYEES_BY_ID} />
    </div>
  );
}
