/**
 * Incremental Jira → Postgres sync.
 * Triggered by /api/jira/sync (cron) or webhook.
 */
import crypto from "node:crypto";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { tasks, syncRuns } from "@/lib/db/schema";
import { fetchUpdatedSince, mapStatus, mapProject } from "./client";

export async function syncJira() {
  const db = getDb();
  const runId = crypto.randomUUID();
  const startedAt = new Date();

  await db.insert(syncRuns).values({
    id: runId,
    source: "jira",
    startedAt,
    itemsProcessed: 0,
  });

  try {
    // Find the last successful sync
    const [last] = await db
      .select()
      .from(syncRuns)
      .where(eq(syncRuns.source, "jira"))
      .orderBy(desc(syncRuns.startedAt))
      .limit(2); // current run + previous

    // Use previous run's startedAt, or 30 days ago if first run
    const since = last
      ? new Date(last.startedAt.getTime() - 60_000) // 1min overlap to avoid gaps
      : new Date(Date.now() - 30 * 86_400_000);

    const issues = await fetchUpdatedSince(since.toISOString());

    for (const issue of issues) {
      const projectKey = issue.fields?.project?.key ?? "MAN";
      const module = mapProject(projectKey);
      const status = mapStatus(issue.fields?.status?.name ?? "To Do");

      await db
        .insert(tasks)
        .values({
          id: issue.key,
          title: issue.fields?.summary ?? "(no title)",
          module,
          company: deriveCompany(module, issue),
          subcategory: deriveSubcategory(module, issue),
          assignee: issue.fields?.assignee?.accountId ?? "unassigned",
          status,
          priority: mapPriority(issue.fields?.priority?.name),
          value: 0,
          created: new Date(issue.fields?.created ?? Date.now()),
          updated: new Date(issue.fields?.updated ?? Date.now()),
          jiraRaw: issue,
        })
        .onConflictDoUpdate({
          target: tasks.id,
          set: {
            title: issue.fields?.summary ?? "(no title)",
            status,
            priority: mapPriority(issue.fields?.priority?.name),
            updated: new Date(issue.fields?.updated ?? Date.now()),
            jiraRaw: issue,
          },
        });
    }

    await db
      .update(syncRuns)
      .set({ finishedAt: new Date(), ok: true, itemsProcessed: issues.length })
      .where(eq(syncRuns.id, runId));

    return { ok: true, processed: issues.length };
  } catch (e: any) {
    await db
      .update(syncRuns)
      .set({ finishedAt: new Date(), ok: false, errorMessage: String(e?.message ?? e) })
      .where(eq(syncRuns.id, runId));
    throw e;
  }
}

function mapPriority(p?: string): "low" | "med" | "high" {
  if (!p) return "med";
  const s = p.toLowerCase();
  if (s.includes("high") || s.includes("highest") || s.includes("urgent")) return "high";
  if (s.includes("low") || s.includes("lowest")) return "low";
  return "med";
}

function deriveCompany(module: string, issue: any): string {
  // Customer field, label, or default to the module's primary company
  const labels: string[] = issue.fields?.labels ?? [];
  if (module === "interior") {
    if (labels.some((l) => /montaigne/i.test(l))) return "montaigne";
    if (labels.some((l) => /suofeiya/i.test(l))) return "suofeiya";
    if (labels.some((l) => /buildtech/i.test(l))) return "buildtech";
    if (labels.some((l) => /dnake/i.test(l))) return "dnake";
    return "montaigne";
  }
  if (module === "marine") return "kha";
  if (module === "engineering") return "jupiter";
  return "mana";
}

function deriveSubcategory(module: string, issue: any): string {
  const labels: string[] = issue.fields?.labels ?? [];
  if (module === "marine") {
    if (labels.some((l) => /fiberglass/i.test(l))) return "Fiberglass";
    return "Steel";
  }
  if (module === "mana") {
    if (labels.some((l) => /real.?estate/i.test(l))) return "Real Estate";
    if (labels.some((l) => /consult/i.test(l))) return "Consulting";
    return "Back Office";
  }
  if (module === "engineering") {
    if (labels.some((l) => /mep/i.test(l))) return "MEP";
    if (labels.some((l) => /structural/i.test(l))) return "Structural";
    return "Civil";
  }
  return deriveCompany(module, issue);
}

// CLI entrypoint
if (require.main === module) {
  syncJira()
    .then((r) => {
      console.log("Sync complete:", r);
      process.exit(0);
    })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
