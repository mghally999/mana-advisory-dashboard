import type { NextAuthConfig } from "next-auth";
import { GUEST_COOKIE } from "@/lib/guest-constants";

const GUEST_MODE = process.env.NEXT_PUBLIC_GUEST_MODE === "true";

/**
 * Edge-safe Auth.js v5 config.
 * No DB adapter, no bcrypt — those live in `src/lib/auth.ts` (Node runtime only).
 * This file is safe to import from middleware.
 */
export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  trustHost: true,
  providers: [], // real providers attached in src/lib/auth.ts
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      if (GUEST_MODE) return true;
      const open = ["/login", "/api/auth", "/api/guest", "/_next", "/favicon"];
      if (open.some((p) => pathname.startsWith(p))) return true;
      if (request.cookies.get(GUEST_COOKIE)?.value === "1") return true;
      return !!auth?.user;
    },
    async jwt({ token, user }) {
      if (user) {
        // @ts-expect-error - we attach custom fields
        token.systemRole = user.systemRole;
        // @ts-expect-error
        token.module = user.module;
        // @ts-expect-error
        token.scopedModules = user.scopedModules;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // @ts-expect-error
        session.user.id = token.sub;
        // @ts-expect-error
        session.user.systemRole = token.systemRole;
        // @ts-expect-error
        session.user.module = token.module;
        // @ts-expect-error
        session.user.scopedModules = token.scopedModules;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
