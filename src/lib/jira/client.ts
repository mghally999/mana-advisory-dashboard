/**
 * Jira Cloud REST API client.
 * - Exponential backoff with jitter on 429/5xx
 * - Cache-aside via Upstash Redis (60s TTL on read endpoints)
 * - Incremental sync via JQL `updated >= <last sync>` filter
 * - Pagination handled internally
 */
import { redis } from "@/lib/cache/redis";

const JIRA_URL = process.env.JIRA_URL ?? ""; // e.g. https://mana.atlassian.net
const JIRA_EMAIL = process.env.JIRA_EMAIL ?? "";
const JIRA_TOKEN = process.env.JIRA_API_TOKEN ?? "";

function authHeader() {
  return "Basic " + Buffer.from(`${JIRA_EMAIL}:${JIRA_TOKEN}`).toString("base64");
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export class JiraError extends Error {
  constructor(public status: number, public body: string) {
    super(`Jira API ${status}: ${body.slice(0, 200)}`);
  }
}

/**
 * Low-level fetch with retry + cache-aside.
 * @param path     API path (relative, e.g. "/rest/api/3/search?jql=...")
 * @param ttl      Optional cache TTL in seconds (omit to bypass cache)
 */
async function jiraFetch(path: string, ttl?: number, retries = 4): Promise<any> {
  if (!JIRA_URL) throw new Error("JIRA_URL not configured");
  const cacheKey = `jira:${path}`;

  if (ttl) {
    const cached = await redis.get<string>(cacheKey);
    if (cached) return JSON.parse(cached);
  }

  let attempt = 0;
  while (true) {
    const res = await fetch(`${JIRA_URL}${path}`, {
      headers: {
        Authorization: authHeader(),
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (res.ok) {
      const body = await res.json();
      if (ttl) await redis.set(cacheKey, JSON.stringify(body), { ex: ttl });
      return body;
    }

    // Retry 429 + 5xx with exponential backoff + jitter
    if ((res.status === 429 || res.status >= 500) && attempt < retries) {
      const base = Math.min(2000 * 2 ** attempt, 30_000);
      const jitter = Math.floor(Math.random() * 500);
      await sleep(base + jitter);
      attempt++;
      continue;
    }

    const text = await res.text().catch(() => "");
    throw new JiraError(res.status, text);
  }
}

/**
 * Search Jira issues with JQL. Handles pagination internally.
 */
export async function searchIssues(jql: string, fields = ["summary", "status", "assignee", "priority", "created", "updated", "project"]) {
  const all: any[] = [];
  let startAt = 0;
  const maxResults = 100;
  while (true) {
    const params = new URLSearchParams({
      jql,
      startAt: String(startAt),
      maxResults: String(maxResults),
      fields: fields.join(","),
    });
    const page = await jiraFetch(`/rest/api/3/search?${params.toString()}`, 60);
    all.push(...(page.issues ?? []));
    if (startAt + maxResults >= (page.total ?? 0)) break;
    startAt += maxResults;
  }
  return all;
}

/**
 * Update issue (e.g. drag-and-drop kanban transition).
 */
export async function transitionIssue(issueKey: string, transitionId: string) {
  const res = await fetch(`${JIRA_URL}/rest/api/3/issue/${issueKey}/transitions`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ transition: { id: transitionId } }),
  });
  if (!res.ok) throw new JiraError(res.status, await res.text());
}

/**
 * Fetch issues updated since the last sync timestamp.
 * Diff-based incremental sync — avoids re-fetching everything.
 */
export async function fetchUpdatedSince(isoTimestamp: string) {
  const jql = `updated >= "${isoTimestamp}" ORDER BY updated DESC`;
  return searchIssues(jql);
}

/**
 * Map a Jira status name → our internal status enum.
 */
export function mapStatus(jiraStatus: string): "lead" | "todo" | "in_progress" | "finished" {
  const s = jiraStatus.toLowerCase();
  if (s.includes("lead")) return "lead";
  if (s.includes("progress") || s.includes("doing")) return "in_progress";
  if (s.includes("done") || s.includes("finish") || s.includes("closed")) return "finished";
  return "todo";
}

/**
 * Map Jira project key (MAR/INT/MAN/ENG) → our module ID.
 */
export function mapProject(projectKey: string): "marine" | "interior" | "mana" | "engineering" {
  const map: Record<string, "marine" | "interior" | "mana" | "engineering"> = {
    MAR: "marine",
    INT: "interior",
    MAN: "mana",
    ENG: "engineering",
  };
  return map[projectKey] ?? "mana";
}
