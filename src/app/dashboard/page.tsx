import { TASKS, EMPLOYEES, REVENUE_TREND, FINANCIAL_SUMMARY, ACTIVITY, EMPLOYEES_BY_ID } from "@/lib/mock-data";
import { auth } from "@/lib/auth";
import { getVisibleTasks } from "@/lib/permissions";
import { KpiGrid } from "@/components/dashboard/kpi-grid";
import { RevenueTrend } from "@/components/dashboard/revenue-trend";
import { ModuleBreakdown } from "@/components/dashboard/module-breakdown";
import { PipelineFunnel } from "@/components/dashboard/pipeline-funnel";
import { StaleTasksCard } from "@/components/dashboard/stale-tasks-card";
import { TopWorkload } from "@/components/dashboard/top-workload";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { ExportMenu } from "@/components/dashboard/export-menu";
import { isGuest } from "@/lib/guest";

export default async function OverviewPage() {
  let viewer = null;
  if (!(await isGuest())) {
    const session = await auth().catch(() => null);
    const id = (session?.user as any)?.id;
    viewer = id ? EMPLOYEES_BY_ID[id] ?? null : null;
  }
  const tasks = getVisibleTasks(TASKS, viewer);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <p className="text-[10px] tracking-[0.2em] uppercase text-muted">Executive Overview</p>
          <h1 className="font-display text-3xl text-ink mt-1">Good day, {viewer?.name?.split(" ")[0] ?? "team"}.</h1>
          <p className="text-sm text-muted mt-1">{new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
        </div>
        <ExportMenu />
      </div>

      <div className="gold-divider" />

      <KpiGrid {...FINANCIAL_SUMMARY} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2"><RevenueTrend data={REVENUE_TREND} /></div>
        <PipelineFunnel tasks={tasks} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ModuleBreakdown tasks={tasks} />
        <StaleTasksCard tasks={tasks} employeesById={EMPLOYEES_BY_ID} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopWorkload tasks={tasks} employees={EMPLOYEES} />
        <ActivityFeed activity={ACTIVITY} employeesById={EMPLOYEES_BY_ID} />
      </div>
    </div>
  );
}
