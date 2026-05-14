import { NextResponse } from "next/server";
import { renderExecutivePdf } from "@/lib/export/pdf";
import { TASKS, EMPLOYEES, REVENUE_TREND, FINANCIAL_SUMMARY, EMPLOYEES_BY_ID } from "@/lib/mock-data";
import { getVisibleTasks } from "@/lib/permissions";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth().catch(() => null);
  const userId = (session?.user as any)?.id;
  const viewer = userId ? EMPLOYEES_BY_ID[userId] : null;
  const tasks = getVisibleTasks(TASKS, viewer);

  const buf = await renderExecutivePdf({
    title: "Executive Dashboard Report",
    asOf: new Date(),
    tasks,
    employees: EMPLOYEES,
    financials: FINANCIAL_SUMMARY,
    revenueTrend: REVENUE_TREND,
  });

  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="mana-dashboard-${Date.now()}.pdf"`,
    },
  });
}
