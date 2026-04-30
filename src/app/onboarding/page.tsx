"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/context/AppContext";
import type { Role } from "@/types";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

function OnboardingForm() {
  const { signin } = useApp();
  const router = useRouter();
  const params = useSearchParams();

  const defaultRole: Role = (params.get("role") as Role) ?? "student";

  const [step, setStep] = useState<"role" | "info">("role");
  const [role, setRole] = useState<Role>(defaultRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [classCode, setClassCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim() || !email.trim()) {
      setError("Please fill in your name and email.");
      return;
    }
    setLoading(true);
    try {
      await signin(name.trim(), email.trim(), role, classCode.trim() || undefined);
      router.replace(role === "teacher" ? "/teacher" : "/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (step === "role") {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome to HighFin</h1>
        <p className="text-slate-500 mb-8">Tell us who you are to get started.</p>
        <div className="flex flex-col gap-3 mb-8">
          {(["student", "teacher", "parent"] as Role[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={[
                "flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all",
                role === r
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-slate-200 bg-white hover:border-slate-300",
              ].join(" ")}
            >
              <span className="text-2xl">
                {r === "student" ? "🎓" : r === "teacher" ? "👩‍🏫" : "👪"}
              </span>
              <div>
                <p className="font-semibold text-slate-800 capitalize">{r}</p>
                <p className="text-sm text-slate-500">
                  {r === "student" && "Learn investing through simulation"}
                  {r === "teacher" && "Assign activities and track progress"}
                  {r === "parent" && "Practice alongside your student"}
                </p>
              </div>
            </button>
          ))}
        </div>
        <Button fullWidth onClick={() => setStep("info")}>
          Continue as {role}
        </Button>
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
      <p className="text-slate-500 mb-8">
        No password needed — just your name and email.
      </p>
      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Your name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Johnson"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@school.edu"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
          {role === "student" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Class code{" "}
                <span className="text-slate-400 font-normal">(optional)</span>
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
            {loading ? "Signing in…" : "Start Learning"}
          </Button>
        </form>
      </Card>
      <p className="text-xs text-slate-400 text-center mt-4">
        Returning user? Enter the same email to pick up where you left off.
      </p>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense>
      <OnboardingForm />
    </Suspense>
  );
}
