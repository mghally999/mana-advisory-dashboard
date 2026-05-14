import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isGuest } from "@/lib/guest";
import { z } from "zod";

const moveSchema = z.object({
  taskId: z.string(),
  newStatus: z.enum(["lead", "todo", "in_progress", "finished"]),
});

const STATUS_TO_JIRA_TRANSITION: Record<string, string> = {
  lead: process.env.JIRA_TRANSITION_LEAD ?? "11",
  todo: process.env.JIRA_TRANSITION_TODO ?? "21",
  in_progress: process.env.JIRA_TRANSITION_IN_PROGRESS ?? "31",
  finished: process.env.JIRA_TRANSITION_FINISHED ?? "41",
};

export async function POST(req: Request) {
  const session = await auth().catch(() => null);
  const guest = await isGuest();

  if (!session && !guest) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = moveSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: parsed.error.message }, { status: 400 });

  const { taskId, newStatus } = parsed.data;

  if (guest || !process.env.JIRA_URL) {
    return NextResponse.json({ ok: true, demo: true, taskId, newStatus });
  }

  try {
    const { transitionIssue } = await import("@/lib/jira/client");
    const transitionId = STATUS_TO_JIRA_TRANSITION[newStatus];
    await transitionIssue(taskId, transitionId);

    // Update our DB to reflect immediately (don't wait for next sync)
    const { getDb } = await import("@/lib/db/client");
    const { tasks } = await import("@/lib/db/schema");
    const { eq } = await import("drizzle-orm");
    await getDb().update(tasks).set({ status: newStatus, updated: new Date() }).where(eq(tasks.id, taskId));

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message ?? e) }, { status: 500 });
  }
}
