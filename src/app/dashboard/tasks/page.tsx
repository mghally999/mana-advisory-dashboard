import { TASKS, EMPLOYEES_BY_ID } from "@/lib/mock-data";
import { auth } from "@/lib/auth";
import { getVisibleTasks } from "@/lib/permissions";
import { TasksTable } from "@/components/tasks-table";
import { TaskSearchBar } from "@/components/task-search-bar";
import { ExportMenu } from "@/components/dashboard/export-menu";
import { isGuest } from "@/lib/guest";

export default async function TasksPage() {
  let viewer = null;
  if (!(await isGuest())) {
    const session = await auth().catch(() => null);
    const id = (session?.user as any)?.id;
    viewer = id ? EMPLOYEES_BY_ID[id] ?? null : null;
  }
  const tasks = getVisibleTasks(TASKS, viewer);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-5">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <p className="text-[10px] tracking-[0.2em] uppercase text-muted">Tasks</p>
          <h1 className="font-display text-3xl text-ink mt-1">All Tasks</h1>
        </div>
        <div className="flex gap-3 items-center">
          <TaskSearchBar tasks={tasks} employeesById={EMPLOYEES_BY_ID} />
          <ExportMenu />
        </div>
      </div>
      <div className="gold-divider" />
      <TasksTable tasks={tasks} employeesById={EMPLOYEES_BY_ID} />
    </div>
  );
}
