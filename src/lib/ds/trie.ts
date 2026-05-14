/**
 * Trie (prefix tree) — used by the dashboard search bar to give MM
 * instant autocomplete across every task title, ID and assignee name
 * without round-tripping to the database.
 *
 * Each node holds the set of task IDs whose tokens pass through it,
 * so prefix queries return matches in O(L + R) where L is the prefix
 * length and R is the result size — independent of the total task
 * count. Multi-word queries intersect the per-word result sets.
 */
class TrieNode {
  children = new Map<string, TrieNode>();
  taskIds = new Set<string>();
  isEnd = false;
}

export class Trie {
  private root = new TrieNode();

  private tokenize(text: string): string[] {
    return text.toLowerCase().split(/\s+/).filter((t) => t.length > 0);
  }

  insert(text: string, taskId: string): void {
    for (const token of this.tokenize(text)) {
      let node = this.root;
      for (const ch of token) {
        let next = node.children.get(ch);
        if (!next) {
          next = new TrieNode();
          node.children.set(ch, next);
        }
        node = next;
        node.taskIds.add(taskId);
      }
      node.isEnd = true;
    }
  }

  remove(text: string, taskId: string): void {
    for (const token of this.tokenize(text)) {
      let node = this.root;
      const path: TrieNode[] = [];
      for (const ch of token) {
        const next = node.children.get(ch);
        if (!next) break;
        path.push(next);
        node = next;
        node.taskIds.delete(taskId);
      }
    }
  }

  /** Recursive collection from a subtree — used after navigating to the prefix. */
  private collect(node: TrieNode, into: Set<string>): void {
    for (const id of node.taskIds) into.add(id);
    for (const child of node.children.values()) this.collect(child, into);
  }

  search(query: string): Set<string> {
    const tokens = this.tokenize(query);
    if (tokens.length === 0) return new Set();
    let combined: Set<string> | null = null;
    for (const token of tokens) {
      let node = this.root;
      for (const ch of token) {
        const next = node.children.get(ch);
        if (!next) return new Set();
        node = next;
      }
      const matches = new Set<string>();
      this.collect(node, matches);
      combined =
        combined === null
          ? matches
          : new Set([...combined].filter((x) => matches.has(x)));
    }
    return combined ?? new Set();
  }

  clear(): void {
    this.root = new TrieNode();
  }
}
