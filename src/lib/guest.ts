import { cookies } from "next/headers";
import { GUEST_COOKIE } from "./guest-constants";

export { GUEST_COOKIE };

export async function isGuest(): Promise<boolean> {
  if (process.env.NEXT_PUBLIC_GUEST_MODE === "true") return true;
  const jar = await cookies();
  return jar.get(GUEST_COOKIE)?.value === "1";
}
