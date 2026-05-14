import type { Task, Employee, ModuleId } from "@/lib/types";

/**
 * Permission rules per the meeting:
 *
 *   - super_admin (MM, Nash): sees everything across all 4 modules.
 *   - admin: scoped to specific module(s). Example given:
 *       "the admin can view interior fitout and mana nothing less nothing more".
 *   - manager: same as admin but only their own module.
 *   - employee: only sees tasks where they are the assignee in their own module.
 *
 * Guest mode (no viewer at all) gets a read-only super-admin view for demos.
 */
export function getVisibleTasks(tasks: Task[], viewer?: Employee | null): Task[] {
  if (!viewer) return tasks; // guest = full read
  if (viewer.systemRole === "super_admin") return tasks;
  if (viewer.systemRole === "admin") {
    const scope = new Set<ModuleId>(viewer.scopedModules ?? [viewer.module]);
    return tasks.filter((t) => scope.has(t.module));
  }
  if (viewer.systemRole === "manager") {
    return tasks.filter((t) => t.module === viewer.module);
  }
  // employee
  return tasks.filter((t) => t.module === viewer.module && t.assignee === viewer.id);
}

export function canViewFinancials(viewer?: Employee | null): boolean {
  if (!viewer) return true; // guest demo
  return viewer.systemRole === "super_admin" || viewer.systemRole === "admin";
}

export function canEditTask(viewer: Employee | null, task: Task): boolean {
  if (!viewer) return false; // guest = read-only
  if (viewer.systemRole === "super_admin") return true;
  if (viewer.systemRole === "admin") {
    return (viewer.scopedModules ?? [viewer.module]).includes(task.module);
  }
  return task.assignee === viewer.id;
}
