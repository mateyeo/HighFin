"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/frontend/context/AppContext";
import { fetchApi } from "@/frontend/lib/config";
import Button from "@/frontend/components/ui/Button";
import Card from "@/frontend/components/ui/Card";

function LoginForm() {
  const { login } = useApp();
  const router    = useRouter();
  const params    = useSearchParams();
  const next      = params.get("next") ?? "/dashboard";

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [unverifiedEmail,   setUnverifiedEmail]   = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setNeedsVerification(false);

    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace(next);
    } catch (err) {
      if (err instanceof Error) {
        const e = err as Error & { code?: string; email?: string };
        if (e.code === "EMAIL_NOT_VERIFIED") {
          setNeedsVerification(true);
          setUnverifiedEmail(e.email ?? email);
        } else {
          setError(e.message);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  if (needsVerification) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">📧</div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Verify your email first</h2>
        <p className="text-slate-500 mb-6">
          Your email <strong>{unverifiedEmail}</strong> hasn&rsquo;t been verified yet.
          Check your inbox for the verification link.
        </p>
        <div className="flex flex-col gap-3">
          <Button
            variant="secondary"
            onClick={async () => {
              await fetchApi("/api/auth/resend-verification", {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({ email: unverifiedEmail }),
              });
              alert("A new verification link has been sent.");
            }}
          >
            Resend verification email
          </Button>
          <button
            type="button"
            className="text-sm text-slate-500 hover:text-slate-700"
            onClick={() => { setNeedsVerification(false); setError(""); }}
          >
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome back</h1>
      <p className="text-slate-500 mb-8">Sign in to continue learning.</p>

      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@school.edu"
              autoComplete="email"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              autoComplete="current-password"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          <Button type="submit" fullWidth size="lg" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </Card>

      <p className="text-sm text-center text-slate-500 mt-4">
        New to HighFin?{" "}
        <Link href="/register" className="text-emerald-600 hover:underline">Create an account</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
