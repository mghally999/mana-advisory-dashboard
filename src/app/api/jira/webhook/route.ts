import { NextResponse } from "next/server";
import { syncJira } from "@/lib/jira/sync";

const WEBHOOK_SECRET = process.env.JIRA_WEBHOOK_SECRET ?? "";

export async function POST(req: Request) {
  if (WEBHOOK_SECRET) {
    const provided = req.headers.get("x-jira-webhook-secret");
    if (provided !== WEBHOOK_SECRET) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
  }
  // Webhook payload contains the changed issue, but easiest correct behavior
  // is to trigger an incremental sync that pulls everything updated since
  // the last run — handles missed webhooks too.
  try {
    const r = await syncJira();
    return NextResponse.json(r);
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message ?? e) }, { status: 500 });
  }
}
