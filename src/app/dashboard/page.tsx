"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/frontend/context/AppContext";
import Card from "@/frontend/components/ui/Card";
import Button from "@/frontend/components/ui/Button";
import { PROFILE_DESCRIPTIONS } from "@/frontend/lib/quiz";

interface Step {
  href: string;
  label: string;
  description: string;
  done: boolean;
  locked: boolean;
}

export default function DashboardPage() {
  const { user, quizResult, goalPlan, portfolio, simulationResult } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (user?.role === "teacher") router.replace("/teacher");
  }, [user, router]);

  if (!user) return null;
  if (user.role === "teacher") return null;

  const steps: Step[] = [
    {
      href: "/quiz",
      label: "Risk Quiz",
      description: "Find out what kind of investor you are.",
      done: !!quizResult,
      locked: false,
    },
    {
      href: "/goal",
      label: "Set a Goal",
      description: "Choose what you're investing toward.",
      done: !!goalPlan,
      locked: !quizResult,
    },
    {
      href: "/portfolio",
      label: "Build Portfolio",
      description: "Choose your investment mix.",
      done: !!portfolio,
      locked: !goalPlan,
    },
    {
      href: "/simulation",
      label: "Run Simulation",
      description: "See how your portfolio might grow over time.",
      done: !!simulationResult,
      locked: !portfolio,
    },
  ];

  const nextStep = steps.find((s) => !s.done && !s.locked);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Hello, {user.name.split(" ")[0]}!
        </h1>
        <p className="text-slate-500 mt-1">Here&rsquo;s your learning progress.</p>
      </div>

      {quizResult && (
        <Card className="mb-6 bg-emerald-50 border-emerald-100">
          <p className="text-sm text-emerald-700 font-medium mb-1">Your investor profile</p>
          <p className="text-xl font-bold text-emerald-900 capitalize">
            {PROFILE_DESCRIPTIONS[quizResult.riskProfile].title}
          </p>
          <p className="text-sm text-emerald-700 mt-1">
            Score: {quizResult.score}/100
          </p>
        </Card>
      )}

      <div className="flex flex-col gap-4 mb-8">
        {steps.map((step, i) => (
          <div
            key={step.href}
            className={[
              "flex items-center gap-4 p-4 rounded-2xl border transition-all",
              step.done
                ? "bg-emerald-50 border-emerald-200"
                : step.locked
                ? "bg-slate-50 border-slate-100 opacity-60"
                : "bg-white border-slate-200 hover:border-emerald-300",
            ].join(" ")}
          >
            <div
              className={[
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
                step.done
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-200 text-slate-500",
              ].join(" ")}
            >
              {step.done ? "✓" : i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-800">{step.label}</p>
              <p className="text-sm text-slate-500 truncate">{step.description}</p>
            </div>
            {!step.locked && (
              <Link href={step.href}>
                <Button size="sm" variant={step.done ? "secondary" : "primary"}>
                  {step.done ? "Review" : "Start"}
                </Button>
              </Link>
            )}
          </div>
        ))}
      </div>

      {nextStep && (
        <div className="text-center">
          <Link href={nextStep.href}>
            <Button size="lg">Continue: {nextStep.label} →</Button>
          </Link>
        </div>
      )}

      {!nextStep && simulationResult && (
        <div className="text-center">
          <Link href="/results">
            <Button size="lg">View My Results →</Button>
          </Link>
        </div>
      )}

      <div className="mt-8 text-center">
        <Link href="/glossary" className="text-sm text-emerald-600 hover:underline">
          📖 Open Glossary — learn key investing terms
        </Link>
      </div>
    </div>
  );
}
