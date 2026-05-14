import { SegmentTree } from "@/lib/ds/segment-tree";

/**
 * Revenue range-sum analytics.
 *
 * Backed by a segment tree so any "revenue between day i and day j"
 * is O(log n) even as we move from 12 monthly buckets to thousands of
 * daily ones. The dashboard's date-range picker calls into this.
 */
export class RevenueAnalytics {
  private revTree: SegmentTree;
  private costTree: SegmentTree;

  constructor(public revenue: number[], public cost: number[], public labels: string[]) {
    if (revenue.length !== cost.length || revenue.length !== labels.length) {
      throw new Error("Revenue, cost and labels must be equal length");
    }
    this.revTree = new SegmentTree(revenue);
    this.costTree = new SegmentTree(cost);
  }

  revenueIn(from: number, to: number): number {
    return this.revTree.query(from, to);
  }

  costIn(from: number, to: number): number {
    return this.costTree.query(from, to);
  }

  netProfitIn(from: number, to: number): number {
    return this.revenueIn(from, to) - this.costIn(from, to);
  }

  marginIn(from: number, to: number): number {
    const r = this.revenueIn(from, to);
    if (r === 0) return 0;
    return (this.netProfitIn(from, to) / r) * 100;
  }

  updateRevenue(index: number, value: number) {
    this.revTree.update(index, value);
    this.revenue[index] = value;
  }

  updateCost(index: number, value: number) {
    this.costTree.update(index, value);
    this.cost[index] = value;
  }
}
