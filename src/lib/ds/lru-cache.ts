import { DoublyLinkedList, DLLNode } from "./doubly-linked-list";

/**
 * LRU (Least Recently Used) cache — O(1) get and set.
 *
 * Implementation: a HashMap (Map) from key → DLL node, paired with a
 * DoublyLinkedList that orders nodes by recency. On every access we
 * move the touched node to the head; when capacity is exceeded we pop
 * the tail. Both operations are O(1) because the hashmap gives us a
 * direct pointer into the linked list.
 *
 * Used in front of Redis (which itself is in front of Jira/Zoho APIs)
 * to cut request latency to single-digit microseconds for hot reads.
 */
export class LRUCache<K, V> {
  private map = new Map<K, DLLNode<K, V>>();
  private dll = new DoublyLinkedList<K, V>();
  private hits = 0;
  private misses = 0;

  constructor(private capacity: number = 100) {
    if (capacity < 1) throw new Error("LRU capacity must be >= 1");
  }

  get(key: K): V | null {
    const node = this.map.get(key);
    if (!node) {
      this.misses++;
      return null;
    }
    if (node.expiresAt !== null && Date.now() > node.expiresAt) {
      this.delete(key);
      this.misses++;
      return null;
    }
    this.dll.moveToFront(node);
    this.hits++;
    return node.value;
  }

  set(key: K, value: V, ttlMs?: number): void {
    const existing = this.map.get(key);
    if (existing) {
      existing.value = value;
      existing.expiresAt = ttlMs ? Date.now() + ttlMs : null;
      this.dll.moveToFront(existing);
      return;
    }
    const node = new DLLNode(key, value);
    node.expiresAt = ttlMs ? Date.now() + ttlMs : null;
    this.map.set(key, node);
    this.dll.pushFront(node);
    if (this.dll.size > this.capacity) {
      const evicted = this.dll.popBack();
      if (evicted) this.map.delete(evicted.key);
    }
  }

  delete(key: K): boolean {
    const node = this.map.get(key);
    if (!node) return false;
    this.dll.remove(node);
    this.map.delete(key);
    return true;
  }

  has(key: K): boolean {
    const node = this.map.get(key);
    if (!node) return false;
    if (node.expiresAt !== null && Date.now() > node.expiresAt) {
      this.delete(key);
      return false;
    }
    return true;
  }

  clear(): void {
    this.map.clear();
    this.dll.head = this.dll.tail = null;
    this.dll.size = 0;
  }

  get size(): number {
    return this.dll.size;
  }

  stats() {
    const total = this.hits + this.misses;
    return {
      hits: this.hits,
      misses: this.misses,
      hitRate: total ? (this.hits / total) * 100 : 0,
      size: this.dll.size,
      capacity: this.capacity,
    };
  }
}
