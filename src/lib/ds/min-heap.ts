/**
 * Generic binary min-heap.
 *
 * Used by:
 *   - Stale-task detector: "find the K oldest in-progress tickets" for
 *     management review. Heap of size K is O(n log K) vs O(n log n) full sort.
 *   - Workload ranker: "top K most-loaded assignees".
 *   - Rate-limiter (future): "next K timeslots available for outbound Jira calls".
 */
export class MinHeap<T> {
  private a: T[] = [];
  constructor(private cmp: (a: T, b: T) => number) {}

  push(x: T): void {
    this.a.push(x);
    this.bubbleUp(this.a.length - 1);
  }

  pop(): T | null {
    if (this.a.length === 0) return null;
    const top = this.a[0];
    const last = this.a.pop()!;
    if (this.a.length) {
      this.a[0] = last;
      this.sinkDown(0);
    }
    return top;
  }

  peek(): T | null {
    return this.a[0] ?? null;
  }

  size(): number {
    return this.a.length;
  }

  private bubbleUp(i: number): void {
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.cmp(this.a[i], this.a[parent]) < 0) {
        [this.a[i], this.a[parent]] = [this.a[parent], this.a[i]];
        i = parent;
      } else break;
    }
  }

  private sinkDown(i: number): void {
    const n = this.a.length;
    while (true) {
      const l = i * 2 + 1;
      const r = l + 1;
      let smallest = i;
      if (l < n && this.cmp(this.a[l], this.a[smallest]) < 0) smallest = l;
      if (r < n && this.cmp(this.a[r], this.a[smallest]) < 0) smallest = r;
      if (smallest === i) break;
      [this.a[i], this.a[smallest]] = [this.a[smallest], this.a[i]];
      i = smallest;
    }
  }
}

/**
 * Top-K selection using a min-heap of size K.
 * cmp(a, b) < 0 means "a is smaller", so we keep the K largest by
 * popping the heap's min whenever a larger element arrives.
 */
export function topK<T>(items: Iterable<T>, k: number, cmp: (a: T, b: T) => number): T[] {
  if (k <= 0) return [];
  const heap = new MinHeap<T>(cmp);
  for (const item of items) {
    if (heap.size() < k) {
      heap.push(item);
    } else {
      const top = heap.peek()!;
      if (cmp(top, item) < 0) {
        heap.pop();
        heap.push(item);
      }
    }
  }
  const out: T[] = [];
  while (heap.size()) out.push(heap.pop()!);
  return out.reverse();
}
