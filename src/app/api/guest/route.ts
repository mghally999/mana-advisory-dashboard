import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { GUEST_COOKIE } from "@/lib/guest";

export async function POST() {
  const jar = await cookies();
  jar.set({
    name: GUEST_COOKIE,
    value: "1",
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 8,
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const jar = await cookies();
  jar.delete(GUEST_COOKIE);
  return NextResponse.json({ ok: true });
}
