import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;

// Lazy singleton so the module can be imported in environments where DATABASE_URL
// isn't set (e.g. guest-mode demo, edge runtime importing types).
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;
let _client: postgres.Sql | null = null;

export function getDb() {
  if (_db) return _db;
  if (!url) throw new Error("DATABASE_URL is not set");
  _client = postgres(url, { max: 10, idle_timeout: 20 });
  _db = drizzle(_client, { schema });
  return _db;
}

export async function closeDb() {
  if (_client) {
    await _client.end({ timeout: 5 });
    _client = null;
    _db = null;
  }
}
