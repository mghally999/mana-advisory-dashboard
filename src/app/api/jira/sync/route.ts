import { NextResponse } from "next/server";
import { syncJira } from "@/lib/jira/sync";
import { auth } from "@/lib/auth";

const CRON_SECRET = process.env.CRON_SECRET ?? "";

async function isAuthorized(req: Request): Promise<boolean> {
  const cron = req.headers.get("x-cron-secret");
  if (CRON_SECRET && cron === CRON_SECRET) return true;
  const session = await auth().catch(() => null);
  return (session?.user as any)?.systemRole === "super_admin";
}

export async function POST(req: Request) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  try {
    const result = await syncJira();
    return NextResponse.json({ ok: true, ...result });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message ?? e) }, { status: 500 });
  }
}

export const GET = POST;
