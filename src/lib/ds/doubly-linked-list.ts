/**
 * Doubly Linked List — O(1) insertion and removal at any known node.
 * Used as the ordering structure inside our LRU cache: most-recently-used
 * stays at head, least-recently-used falls off tail.
 *
 * Why DLL over arrays here:
 *   array.splice() is O(n); LRU needs O(1) "move node to head" on every cache hit.
 *   With a hashmap pointing into the DLL, we get true O(1) get + set.
 */
export class DLLNode<K, V> {
  prev: DLLNode<K, V> | null = null;
  next: DLLNode<K, V> | null = null;
  expiresAt: number | null = null;
  constructor(public key: K, public value: V) {}
}

export class DoublyLinkedList<K, V> {
  head: DLLNode<K, V> | null = null;
  tail: DLLNode<K, V> | null = null;
  size = 0;

  pushFront(node: DLLNode<K, V>): void {
    node.prev = null;
    node.next = this.head;
    if (this.head) this.head.prev = node;
    this.head = node;
    if (!this.tail) this.tail = node;
    this.size++;
  }

  remove(node: DLLNode<K, V>): void {
    if (node.prev) node.prev.next = node.next;
    else this.head = node.next;
    if (node.next) node.next.prev = node.prev;
    else this.tail = node.prev;
    node.prev = node.next = null;
    this.size--;
  }

  moveToFront(node: DLLNode<K, V>): void {
    this.remove(node);
    this.pushFront(node);
  }

  popBack(): DLLNode<K, V> | null {
    if (!this.tail) return null;
    const t = this.tail;
    this.remove(t);
    return t;
  }

  *[Symbol.iterator](): IterableIterator<DLLNode<K, V>> {
    let cur = this.head;
    while (cur) {
      yield cur;
      cur = cur.next;
    }
  }
}
