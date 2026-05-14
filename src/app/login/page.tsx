"use client";
import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Wordmark } from "@/components/wordmark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme";
import { AlertCircle, Eye, Loader2 } from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const router = useRouter();
  const search = useSearchParams();
  const callbackUrl = search.get("callbackUrl") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const r = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (r?.error) setErr("Invalid email or password");
    else router.push(callbackUrl);
  }

  async function onGuest() {
    setErr(null);
    setGuestLoading(true);
    const r = await fetch("/api/guest", { method: "POST" });
    if (!r.ok) {
      setGuestLoading(false);
      setErr("Could not start guest session");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 right-0 h-[60vh] w-[60vh] rounded-full bg-gold/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[40vh] w-[40vh] rounded-full bg-mana/10 blur-3xl" />
      </div>
      <div className="absolute top-6 right-6"><ThemeToggle /></div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Wordmark size="lg" />
        </div>
        <div className="rounded-xl bg-surface border border-border shadow-xl p-8">
          <h1 className="font-display text-2xl mb-1">Welcome back</h1>
          <p className="text-sm text-muted mb-6">Sign in to the executive dashboard.</p>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-muted block mb-1.5">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required placeholder="name@mana.local" />
            </div>
            <div>
              <label className="text-xs text-muted block mb-1.5">Password</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
            </div>
            {err && (
              <div className="flex items-center gap-2 text-xs text-danger bg-danger/10 border border-danger/30 rounded-md p-2">
                <AlertCircle size={14} /> {err}
              </div>
            )}
            <Button type="submit" disabled={loading || guestLoading} className="w-full">
              {loading ? <><Loader2 size={14} className="animate-spin" /> Signing in...</> : "Sign in"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex-1 h-px bg-border" />
              <span className="text-[10px] tracking-[0.2em] uppercase text-muted">Or</span>
              <span className="flex-1 h-px bg-border" />
            </div>
            <button
              type="button"
              onClick={onGuest}
              disabled={loading || guestLoading}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-md text-sm text-gold border border-gold/40 bg-gold-bg hover:bg-gold/10 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {guestLoading ? (
                <><Loader2 size={14} className="animate-spin" /> Opening demo...</>
              ) : (
                <><Eye size={14} /> Continue as guest (read-only)</>
              )}
            </button>
            <p className="text-[10px] tracking-[0.2em] uppercase text-muted text-center">
              Confidential · Mana Advisory Group
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
