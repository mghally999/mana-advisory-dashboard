/**
 * Zoho → Postgres sync.
 * Pulls monthly P&L and stores as a financial_snapshot.
 */
import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { financialSnapshots, syncRuns } from "@/lib/db/schema";
import { fetchPnL } from "./client";

export async function syncZoho() {
  const db = getDb();
  const runId = crypto.randomUUID();
  const startedAt = new Date();

  await db.insert(syncRuns).values({
    id: runId,
    source: "zoho",
    startedAt,
    itemsProcessed: 0,
  });

  try {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    const fromStr = from.toISOString().split("T")[0];
    const toStr = now.toISOString().split("T")[0];

    const pnl = await fetchPnL(fromStr, toStr);

    // Extract 3 KPIs — Zoho's report structure has many forms; defensive parse
    const totalRevenue = extractAmount(pnl, ["operating_revenue", "total_revenue", "income"]);
    const totalCost = extractAmount(pnl, ["operating_expense", "total_expense", "expense", "cost"]);
    const netProfit = totalRevenue - totalCost;

    const snapId = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    await db
      .insert(financialSnapshots)
      .values({
        id: snapId,
        asOf: now,
        totalRevenue,
        totalCost,
        netProfit,
        netProfitOverridden: false,
        source: "zoho",
      })
      .onConflictDoUpdate({
        target: financialSnapshots.id,
        set: {
          asOf: now,
          totalRevenue,
          totalCost,
          netProfit,
          source: "zoho",
        },
      });

    await db
      .update(syncRuns)
      .set({ finishedAt: new Date(), ok: true, itemsProcessed: 1 })
      .where(eq(syncRuns.id, runId));

    return { ok: true, totalRevenue, totalCost, netProfit };
  } catch (e: any) {
    await db
      .update(syncRuns)
      .set({ finishedAt: new Date(), ok: false, errorMessage: String(e?.message ?? e) })
      .where(eq(syncRuns.id, runId));
    throw e;
  }
}

function extractAmount(report: any, keys: string[]): number {
  // Walk the (possibly nested) report tree looking for the first matching key
  const walk = (node: any): number | null => {
    if (!node) return null;
    if (typeof node === "object") {
      for (const k of Object.keys(node)) {
        const lower = k.toLowerCase();
        if (keys.some((needle) => lower.includes(needle))) {
          const v = node[k];
          if (typeof v === "number") return v;
          if (typeof v === "string" && !isNaN(Number(v))) return Number(v);
          if (v?.total != null) return Number(v.total);
        }
      }
      for (const k of Object.keys(node)) {
        const sub = walk(node[k]);
        if (sub != null) return sub;
      }
    }
    return null;
  };
  return walk(report) ?? 0;
}

if (require.main === module) {
  syncZoho()
    .then((r) => {
      console.log("Zoho sync complete:", r);
      process.exit(0);
    })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
