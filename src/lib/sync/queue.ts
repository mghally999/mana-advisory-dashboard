import { SinglyLinkedList } from "@/lib/ds/singly-linked-list";

/**
 * In-process sync job queue. Backed by a singly-linked list because we
 * only ever append to the tail and consume from the head — no random
 * access needed. This is intentionally simpler/lighter than the LRU's
 * DLL.
 *
 * For production we hand jobs to Inngest for at-least-once delivery,
 * retries and observability — but in dev/demo this in-memory queue
 * lets us validate the sync logic without any infra.
 */
export type SyncJob =
  | { kind: "task_status_change"; taskId: string; from: string; to: string; ts: number }
  | { kind: "task_created"; taskId: string; ts: number }
  | { kind: "task_assignee_change"; taskId: string; from: string; to: string; ts: number }
  | { kind: "jira_pull"; module: string; since: number };

const queue = new SinglyLinkedList<SyncJob>();

export function enqueue(job: SyncJob): void {
  queue.enqueue(job);
}

export function dequeue(): SyncJob | null {
  return queue.dequeue();
}

export function peek(): SyncJob | null {
  return queue.peek();
}

export function pending(): number {
  return queue.size;
}

/** Replay queue in reverse chronological order for incident debugging. */
export function replayReverse(): SyncJob[] {
  queue.reverse();
  const out = queue.toArray();
  queue.reverse(); // restore
  return out;
}
