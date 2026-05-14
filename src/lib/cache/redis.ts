import { Redis } from "@upstash/redis";

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

/**
 * Redis L2 cache. If Upstash isn't configured we expose a no-op stub
 * so the dashboard keeps working in dev/demo. Production should always
 * have Redis on for cross-instance cache sharing.
 */
export const redis: Pick<Redis, "get" | "set" | "del"> =
  url && token
    ? new Redis({ url, token })
    : {
        get: async () => null,
        set: async () => "OK",
        del: async () => 0,
      } as unknown as Redis;

export const REDIS_ENABLED = Boolean(url && token);
