"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/frontend/context/AppContext";
import type { Role } from "@/types";
import Button from "@/frontend/components/ui/Button";
import Card from "@/frontend/components/ui/Card";

const ROLES: { value: Role; label: string; icon: string; description: string }[] = [
  { value: "student", label: "Student",  icon: "🎓", description: "Learn investing through simulation" },
  { value: "teacher", label: "Teacher",  icon: "👩‍🏫", description: "Assign activities and track progress" },
  { value: "parent",  label: "Parent",   icon: "👪", description: "Practice alongside your student" },
];

export default function RegisterPage() {
  const { register } = useApp();
  const router = useRouter();

  const [step, setStep] = useState<"role" | "info">("role");
  const [role, setRole]             = useState<Role>("student");
  const [name, setName]             = useState("");
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [confirm, setConfirm]       = useState("");
  const [classCode, setClassCode]   = useState("");
  const [error, setError]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [done, setDone]             = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim() || !email.trim() || !password) {
      setError("All fields are required.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password, role, classCode.trim() || undefined);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">📬</div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Check your inbox</h1>
        <p className="text-slate-500 mb-6">
          We sent a verification link to <strong>{email}</strong>.
          Click it to activate your account — the link expires in 24 hours.
        </p>
        <p className="text-sm text-slate-400 mb-4">
          Didn&rsquo;t get it? Check your spam folder or{" "}
          <button
            type="button"
            className="text-emerald-600 hover:underline"
            onClick={async () => {
              await fetch("/api/auth/resend-verification", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
              });
              alert("A new link has been sent.");
            }}
          >
            resend the email
          </button>
          .
        </p>
        <Link href="/login">
          <Button variant="secondary">Go to sign in</Button>
        </Link>
      </div>
    );
  }

  if (step === "role") {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Create your account</h1>
        <p className="text-slate-500 mb-8">First, tell us who you are.</p>
        <div className="flex flex-col gap-3 mb-8">
          {ROLES.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setRole(r.value)}
              className={[
                "flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all",
                role === r.value
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-slate-200 bg-white hover:border-slate-300",
              ].join(" ")}
            >
              <span className="text-2xl">{r.icon}</span>
              <div>
                <p className="font-semibold text-slate-800">{r.label}</p>
                <p className="text-sm text-slate-500">{r.description}</p>
              </div>
            </button>
          ))}
        </div>
        <Button fullWidth onClick={() => setStep("info")}>Continue as {role} →</Button>
        <p className="text-sm text-center text-slate-500 mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-emerald-600 hover:underline">Sign in</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <button
        type="button"
        onClick={() => setStep("role")}
        className="text-sm text-slate-500 mb-6 hover:text-slate-700"
      >
        ← Back
      </button>
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Create your account</h1>
      <p className="text-slate-500 mb-8">Enter your details to get started.</p>

      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Johnson"
              autoComplete="name"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

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
              placeholder="At least 8 characters"
              autoComplete="new-password"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Confirm password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Same password again"
              autoComplete="new-password"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          {role === "student" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Class code <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={classCode}
                onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                placeholder="e.g. FIN2024"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-base uppercase focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
          )}

          <Button type="submit" fullWidth size="lg" className="mt-2" disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
          </Button>
        </form>
      </Card>

      <p className="text-sm text-center text-slate-500 mt-4">
        Already have an account?{" "}
        <Link href="/login" className="text-emerald-600 hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
