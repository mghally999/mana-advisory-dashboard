import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db/client";
import { financialSnapshots } from "@/lib/db/schema";
import { z } from "zod";

const overrideSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/), // "2026-05"
  netProfit: z.number(),
});

export async function POST(req: Request) {
  const session = await auth().catch(() => null);
  const role = (session?.user as any)?.systemRole;
  if (role !== "super_admin") {
    return NextResponse.json({ ok: false, error: "Only super admin can override net profit" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = overrideSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: parsed.error.message }, { status: 400 });

  const { month, netProfit } = parsed.data;

  try {
    const db = getDb();
    await db
      .insert(financialSnapshots)
      .values({
        id: month,
        asOf: new Date(),
        totalRevenue: 0,
        totalCost: 0,
        netProfit,
        netProfitOverridden: true,
        source: "manual",
      })
      .onConflictDoUpdate({
        target: financialSnapshots.id,
        set: { netProfit, netProfitOverridden: true, source: "manual", asOf: new Date() },
      });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message ?? e) }, { status: 500 });
  }
}
