/**
 * Provision passwords for all 17 user accounts.
 * - Ensures user rows exist (creates if missing)
 * - Generates a random 14-char password per user
 * - Hashes with bcrypt and stores
 * - Prints plaintext ONCE so the team can distribute via a secure channel
 *
 * Run with: pnpm db:provision
 */
import "dotenv/config";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { getDb, closeDb } from "./client";
import { users } from "./schema";
import { EMPLOYEES } from "@/lib/mock-data";

const ALPHABET =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";

function genPassword(len = 14) {
  let pw = "";
  for (let i = 0; i < len; i++) pw += ALPHABET[crypto.randomInt(ALPHABET.length)];
  return pw;
}

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

  console.log(`Provisioning ${EMPLOYEES.length} accounts...\n`);
  console.log("Email                                Password");
  console.log("─".repeat(64));

  for (const e of EMPLOYEES) {
    const email = emailFor(e.name);
    const plain = genPassword();
    const hash = await bcrypt.hash(plain, 10);

    const exists = await db.select().from(users).where(eq(users.id, e.id)).limit(1);
    if (!exists.length) {
      await db.insert(users).values({
        id: e.id,
        name: e.name,
        email,
        passwordHash: hash,
        jobTitle: e.role,
        systemRole: e.systemRole,
        scopedModules: e.scopedModules ?? null,
        module: e.module,
        company: e.company,
        initials: e.initials,
      });
    } else {
      await db.update(users).set({ passwordHash: hash, email }).where(eq(users.id, e.id));
    }

    console.log(`${email.padEnd(37)}${plain}`);
  }

  console.log("\n⚠ Save these credentials NOW — they will not be shown again.");
  console.log("⚠ Distribute via a secure channel and rotate after first login.");
  await closeDb();
}

main().catch(async (e) => {
  console.error(e);
  await closeDb();
  process.exit(1);
});
