/**
 * Seed script — inserts all 17 employees into the `user` table.
 * Passwords are NOT set here; run `pnpm db:provision` after this.
 * Run with: pnpm db:seed
 */
import "dotenv/config";
import { getDb, closeDb } from "./client";
import { users } from "./schema";
import { EMPLOYEES } from "@/lib/mock-data";

function emailFor(name: string) {
  const local = name
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .join(".");
  return `${local}@mana.local`;
}

async function main() {
  const db = getDb();
  console.log(`Seeding ${EMPLOYEES.length} employees...`);
  for (const e of EMPLOYEES) {
    await db
      .insert(users)
      .values({
        id: e.id,
        name: e.name,
        email: emailFor(e.name),
        jobTitle: e.role,
        systemRole: e.systemRole,
        scopedModules: e.scopedModules ?? null,
        module: e.module,
        company: e.company,
        initials: e.initials,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          name: e.name,
          jobTitle: e.role,
          systemRole: e.systemRole,
          scopedModules: e.scopedModules ?? null,
          module: e.module,
          company: e.company,
          initials: e.initials,
        },
      });
    console.log(`  ✓ ${e.name}`);
  }
  console.log("Seed complete.");
  await closeDb();
}

main().catch(async (e) => {
  console.error(e);
  await closeDb();
  process.exit(1);
});
