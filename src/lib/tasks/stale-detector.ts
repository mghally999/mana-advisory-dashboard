import { topK } from "@/lib/ds/min-heap";
import type { Task } from "@/lib/types";

const DAY_MS = 86_400_000;
export const STALE_THRESHOLD_DAYS = 7;

/**
 * Find tasks that have been "In Progress" for >= STALE_THRESHOLD_DAYS,
 * sorted oldest-first (most stale at top). Uses topK with a min-heap of
 * the result size so we never sort the full task array.
 *
 * This drives the "Management review" card on MM's dashboard — the
 * specific feature he asked for in the meeting: "if a task has been
 * in progress for the last 7 days it may require management review".
 */
export function getStaleTasks(tasks: Task[], thresholdDays = STALE_THRESHOLD_DAYS): Task[] {
  const now = Date.now();
  const cutoff = now - thresholdDays * DAY_MS;
  const candidates = tasks.filter(
    (t) => t.status === "in_progress" && t.updated <= cutoff
  );
  // Oldest first — smaller updated timestamp = staler.
  // topK with cmp(a,b) = b.updated - a.updated would keep newest;
  // we want oldest so flip the comparator.
  return topK(candidates, candidates.length, (a, b) => b.updated - a.updated).reverse();
}

/** Convenience: just the count, for the KPI badge. */
export function staleCount(tasks: Task[], thresholdDays = STALE_THRESHOLD_DAYS): number {
  const now = Date.now();
  const cutoff = now - thresholdDays * DAY_MS;
  return tasks.reduce(
    (acc, t) => acc + (t.status === "in_progress" && t.updated <= cutoff ? 1 : 0),
    0
  );
}

export function daysIdle(task: Task): number {
  return Math.floor((Date.now() - task.updated) / DAY_MS);
}
