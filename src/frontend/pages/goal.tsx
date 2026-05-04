"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/frontend/context/AppContext";
import type { GoalType, GoalPlan } from "@/types";
import Button from "@/frontend/components/ui/Button";
import Card from "@/frontend/components/ui/Card";

const GOAL_OPTIONS: { type: GoalType; label: string; icon: string; example: string }[] = [
  { type: "retirement", label: "Retirement",    icon: "🌴", example: "Build long-term wealth for when you stop working." },
  { type: "college",    label: "College Fund",  icon: "🎓", example: "Save for tuition, housing, and books." },
  { type: "house",      label: "Buy a Home",    icon: "🏠", example: "Save for a down payment on a house." },
  { type: "emergency",  label: "Emergency Fund",icon: "🛡️", example: "3–6 months of expenses for unexpected costs." },
  { type: "other",      label: "Other Goal",    icon: "⭐", example: "A trip, a car, starting a business — your call." },
];

function formatCurrency(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export default function GoalPage() {
  const { user, quizResult, goalPlan, setGoalPlan } = useApp();
  const router = useRouter();

  const existing = goalPlan;

  const [goalType, setGoalType] = useState<GoalType>(existing?.goalType ?? "retirement");
  const [targetAmount, setTargetAmount] = useState(existing?.targetAmount ?? 50000);
  const [timeHorizon, setTimeHorizon] = useState(existing?.timeHorizon ?? 10);
  const [monthly, setMonthly] = useState(existing?.monthlyContribution ?? 200);

  useEffect(() => {
    if (!user) router.replace("/login");
    else if (!quizResult) router.replace("/quiz");
  }, [user, quizResult, router]);

  if (!user || !quizResult) return null;

  function handleSave() {
    const plan: GoalPlan = {
      userId: user!.id,
      goalType,
      targetAmount,
      timeHorizon,
      monthlyContribution: monthly,
      createdAt: new Date().toISOString(),
    };
    setGoalPlan(plan);
    router.push("/portfolio");
  }

  const projectedContributions = monthly * 12 * timeHorizon;

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Set Your Financial Goal</h1>
      <p className="text-slate-500 mb-8 text-sm">
        What are you saving and investing toward? This helps us build the right plan.
      </p>

      {/* Goal type selection */}
      <div className="flex flex-col gap-3 mb-6">
        {GOAL_OPTIONS.map((g) => (
          <button
            key={g.type}
            type="button"
            onClick={() => setGoalType(g.type)}
            className={[
              "flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all",
              goalType === g.type
                ? "border-emerald-500 bg-emerald-50"
                : "border-slate-200 bg-white hover:border-slate-300",
            ].join(" ")}
          >
            <span className="text-2xl">{g.icon}</span>
            <div>
              <p className="font-semibold text-slate-800">{g.label}</p>
              <p className="text-xs text-slate-500">{g.example}</p>
            </div>
          </button>
        ))}
      </div>

      <Card className="mb-6">
        {/* Target amount */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Target amount: <span className="text-emerald-700">{formatCurrency(targetAmount)}</span>
          </label>
          <input
            type="range"
            min={1000}
            max={500000}
            step={1000}
            value={targetAmount}
            onChange={(e) => setTargetAmount(Number(e.target.value))}
            className="w-full accent-emerald-500"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>$1,000</span>
            <span>$500,000</span>
          </div>
        </div>

        {/* Time horizon */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Time horizon: <span className="text-emerald-700">{timeHorizon} years</span>
          </label>
          <input
            type="range"
            min={1}
            max={40}
            step={1}
            value={timeHorizon}
            onChange={(e) => setTimeHorizon(Number(e.target.value))}
            className="w-full accent-emerald-500"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>1 year</span>
            <span>40 years</span>
          </div>
        </div>

        {/* Monthly contribution */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Monthly contribution: <span className="text-emerald-700">{formatCurrency(monthly)}</span>
          </label>
          <input
            type="range"
            min={10}
            max={2000}
            step={10}
            value={monthly}
            onChange={(e) => setMonthly(Number(e.target.value))}
            className="w-full accent-emerald-500"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>$10/mo</span>
            <span>$2,000/mo</span>
          </div>
        </div>
      </Card>

      {/* Summary */}
      <Card className="mb-6 bg-slate-50 border-slate-100">
        <p className="text-sm font-semibold text-slate-700 mb-3">Your plan at a glance</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-slate-500">Goal</p>
            <p className="font-semibold text-slate-800 capitalize">{goalType.replace("_", " ")}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Target</p>
            <p className="font-semibold text-slate-800">{formatCurrency(targetAmount)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Time Horizon</p>
            <p className="font-semibold text-slate-800">{timeHorizon} yrs</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">You&rsquo;ll contribute</p>
            <p className="font-semibold text-slate-800">{formatCurrency(projectedContributions)}</p>
          </div>
        </div>
      </Card>

      {/* bottom spacer so sticky bar doesn't overlap last card */}
      <div className="h-24 md:h-20" />

      {/* Sticky action bar */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-sm border-t border-slate-200 px-4 py-3 shadow-lg">
        <div className="max-w-lg mx-auto">
          <Button fullWidth size="lg" onClick={handleSave}>
            Save Goal &amp; Build Portfolio →
          </Button>
        </div>
      </div>
    </div>
  );
}
