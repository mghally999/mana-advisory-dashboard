/**
 * Singly Linked List — lighter than DLL, used as a FIFO queue for the
 * background sync job stream (Jira webhook events waiting to be pushed
 * to our DB). Single-pointer-per-node keeps memory tight.
 *
 * Includes a recursive reverse() — useful when we want to replay sync
 * events in reverse-chronological order during incident debugging.
 */
class SLLNode<T> {
  next: SLLNode<T> | null = null;
  constructor(public value: T) {}
}

export class SinglyLinkedList<T> {
  head: SLLNode<T> | null = null;
  tail: SLLNode<T> | null = null;
  size = 0;

  enqueue(value: T): void {
    const node = new SLLNode(value);
    if (this.tail) this.tail.next = node;
    else this.head = node;
    this.tail = node;
    this.size++;
  }

  dequeue(): T | null {
    if (!this.head) return null;
    const v = this.head.value;
    this.head = this.head.next;
    if (!this.head) this.tail = null;
    this.size--;
    return v;
  }

  peek(): T | null {
    return this.head?.value ?? null;
  }

  /** Recursive reverse — classic CS exercise, useful for event replay. */
  reverse(): void {
    const recur = (prev: SLLNode<T> | null, curr: SLLNode<T> | null): SLLNode<T> | null => {
      if (!curr) return prev;
      const next = curr.next;
      curr.next = prev;
      return recur(curr, next);
    };
    this.tail = this.head;
    this.head = recur(null, this.head);
  }

  toArray(): T[] {
    const out: T[] = [];
    let cur = this.head;
    while (cur) {
      out.push(cur.value);
      cur = cur.next;
    }
    return out;
  }
}
