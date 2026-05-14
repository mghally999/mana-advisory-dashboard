import { NextResponse } from "next/server";
import { renderExecutivePdf } from "@/lib/export/pdf";
import { TASKS, EMPLOYEES, REVENUE_TREND, FINANCIAL_SUMMARY, EMPLOYEES_BY_ID } from "@/lib/mock-data";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const employee = EMPLOYEES_BY_ID[id];
  if (!employee) return new NextResponse("Employee not found", { status: 404 });

  const myTasks = TASKS.filter((t) => t.assignee === id);

  const buf = await renderExecutivePdf({
    title: `${employee.name} — Performance Report`,
    asOf: new Date(),
    tasks: myTasks,
    employees: EMPLOYEES,
    financials: FINANCIAL_SUMMARY,
    revenueTrend: REVENUE_TREND,
  });

  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="employee-${id}-${Date.now()}.pdf"`,
    },
  });
}
