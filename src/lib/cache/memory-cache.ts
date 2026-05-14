import { LRUCache } from "@/lib/ds/lru-cache";

/**
 * App-wide in-memory L1 cache for hot reads.
 *
 * Sits in front of Redis (L2). For dashboard widget queries that get hit
 * 100s of times per second during MM's morning review, this avoids any
 * network hop at all.
 *
 * Capacity is sized for the working set we expect (≤ 500 tasks × a few
 * derived projections each); raise if real-data profiling shows churn.
 */
export const memoryCache = new LRUCache<string, unknown>(500);

export function cacheGet<T>(key: string): T | null {
  return memoryCache.get(key) as T | null;
}

export function cacheSet<T>(key: string, value: T, ttlMs?: number): void {
  memoryCache.set(key, value, ttlMs);
}

export function cacheInvalidate(keyOrPrefix: string): void {
  if (memoryCache.has(keyOrPrefix)) {
    memoryCache.delete(keyOrPrefix);
    return;
  }
  // Prefix invalidation: iterate the underlying DLL once.
  const toDelete: string[] = [];
  for (const node of (memoryCache as unknown as { dll: { [Symbol.iterator](): IterableIterator<{ key: string }> } }).dll) {
    if (typeof node.key === "string" && node.key.startsWith(keyOrPrefix)) toDelete.push(node.key);
  }
  toDelete.forEach((k) => memoryCache.delete(k));
}

export function cacheStats() {
  return memoryCache.stats();
}
