"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/frontend/context/AppContext";
import { fetchApi } from "@/frontend/lib/config";
import type { User } from "@/types";
import Button from "@/frontend/components/ui/Button";

type Status = "loading" | "success" | "error" | "pending";

function VerifyEmailContent() {
  const router  = useRouter();
  const params  = useSearchParams();
  const token   = params.get("token");
  const { login } = useApp();

  const [status,  setStatus]  = useState<Status>(token ? "loading" : "pending");
  const [message, setMessage] = useState("");
  const [resendEmail,  setResendEmail]  = useState("");
  const [resendSent,   setResendSent]   = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (!token) return;

    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((data: { message?: string; error?: string; user?: User }) => {
        if (data.error) {
          setStatus("error");
          setMessage(data.error);
        } else {
          setStatus("success");
          // Session cookie already set by the server — redirect after a beat
          setTimeout(() => router.replace("/dashboard"), 2000);
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      });
  }, [token, router]);

  async function handleResend(e: React.FormEvent) {
    e.preventDefault();
    setResendLoading(true);
    await fetchApi("/api/auth/resend-verification", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email: resendEmail }),
    });
    setResendLoading(false);
    setResendSent(true);
  }

  if (status === "loading") {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4 animate-pulse">🔐</div>
        <p className="text-slate-600">Verifying your email…</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Email verified!</h1>
        <p className="text-slate-500">Redirecting you to your dashboard…</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Verification failed</h1>
        <p className="text-slate-500 mb-6">{message}</p>
        <p className="text-sm text-slate-600 mb-2">Request a new link:</p>
        {resendSent ? (
          <p className="text-emerald-600 font-medium">A new link has been sent — check your inbox.</p>
        ) : (
          <form onSubmit={handleResend} className="flex gap-2 justify-center">
            <input
              type="email"
              value={resendEmail}
              onChange={(e) => setResendEmail(e.target.value)}
              placeholder="your@email.com"
              className="border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <Button type="submit" size="sm" disabled={resendLoading}>
              {resendLoading ? "Sending…" : "Resend"}
            </Button>
          </form>
        )}
        <div className="mt-6">
          <Link href="/login" className="text-sm text-emerald-600 hover:underline">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  // "pending" — no token in URL, user landed here directly
  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <div className="text-5xl mb-4">📬</div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Check your inbox</h1>
      <p className="text-slate-500 mb-6">
        We sent a verification link to your email. Click it to activate your account.
        The link expires in 24 hours.
      </p>
      {resendSent ? (
        <p className="text-emerald-600 font-medium mb-6">New link sent — check your inbox.</p>
      ) : (
        <form onSubmit={handleResend} className="flex flex-col gap-3 items-center mb-6">
          <p className="text-sm text-slate-600">Didn&rsquo;t get it? Resend to:</p>
          <div className="flex gap-2">
            <input
              type="email"
              value={resendEmail}
              onChange={(e) => setResendEmail(e.target.value)}
              placeholder="your@email.com"
              className="border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <Button type="submit" size="sm" disabled={resendLoading}>
              {resendLoading ? "Sending…" : "Resend"}
            </Button>
          </div>
        </form>
      )}
      <Link href="/login" className="text-sm text-emerald-600 hover:underline">
        Back to sign in
      </Link>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
