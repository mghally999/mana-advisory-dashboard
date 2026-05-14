import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { authConfig } from "@/auth.config";
import { getDb } from "@/lib/db/client";
import { users, accounts, sessions } from "@/lib/db/schema";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const GUEST_MODE = process.env.NEXT_PUBLIC_GUEST_MODE === "true";

// Only attach the DB adapter when DATABASE_URL is configured. In guest mode
// (or the very first `pnpm dev` before anyone sets up Postgres) we skip the
// adapter so the app boots without throwing.
const adapter = !GUEST_MODE && process.env.DATABASE_URL
  ? DrizzleAdapter(getDb(), { usersTable: users, accountsTable: accounts, sessionsTable: sessions })
  : undefined;

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        if (GUEST_MODE || !process.env.DATABASE_URL) return null;
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const db = getDb();
        const [u] = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (!u || !u.passwordHash) return null;

        const ok = await bcrypt.compare(password, u.passwordHash);
        if (!ok) return null;

        return {
          id: u.id,
          name: u.name ?? "",
          email: u.email ?? "",
          // @ts-expect-error - custom session fields
          systemRole: u.systemRole,
          module: u.module,
          scopedModules: u.scopedModules ?? undefined,
        };
      },
    }),
  ],
});
