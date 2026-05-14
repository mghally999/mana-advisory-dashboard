import { Trie } from "@/lib/ds/trie";
import type { Task, Employee } from "@/lib/types";

const trie = new Trie();
let indexed = new Map<string, Task>();

/**
 * Build a search index for the entire task table.
 * Call once on startup and on bulk reload; incremental updates use
 * indexTask / removeTask below.
 */
export function buildIndex(tasks: Task[], employees: Record<string, Employee>) {
  trie.clear();
  indexed = new Map(tasks.map((t) => [t.id, t]));
  for (const t of tasks) {
    const assigneeName = employees[t.assignee]?.name ?? "";
    trie.insert(`${t.id} ${t.title} ${t.subcategory} ${assigneeName}`, t.id);
  }
}

export function indexTask(task: Task, assigneeName: string) {
  indexed.set(task.id, task);
  trie.insert(`${task.id} ${task.title} ${task.subcategory} ${assigneeName}`, task.id);
}

export function removeTask(task: Task, assigneeName: string) {
  indexed.delete(task.id);
  trie.remove(`${task.id} ${task.title} ${task.subcategory} ${assigneeName}`, task.id);
}

export function search(query: string, limit = 12): Task[] {
  const ids = trie.search(query);
  const out: Task[] = [];
  for (const id of ids) {
    const t = indexed.get(id);
    if (t) out.push(t);
    if (out.length >= limit) break;
  }
  return out;
}
