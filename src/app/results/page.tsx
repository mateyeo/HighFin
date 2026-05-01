"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/frontend/context/AppContext";
import { PROFILE_DESCRIPTIONS, RECOMMENDED_ALLOCATIONS } from "@/frontend/lib/quiz";
import { SCENARIOS } from "@/frontend/lib/simulation";
import Button from "@/frontend/components/ui/Button";
import Card from "@/frontend/components/ui/Card";

function formatCurrency(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export default function ResultsPage() {
  const { user, quizResult, goalPlan, portfolio, simulationResult } = useApp();
  const router = useRouter();

  if (!user) { router.replace("/onboarding"); return null; }

  const profile = quizResult ? PROFILE_DESCRIPTIONS[quizResult.riskProfile] : null;
  const recommended = quizResult ? RECOMMENDED_ALLOCATIONS[quizResult.riskProfile] : null;
  const scenario = simulationResult ? SCENARIOS[simulationResult.scenarioId] : null;

  const REFLECTION_QUESTIONS = [
    "What would happen if you increased your monthly contribution by $50?",
    "How would a bear market change your strategy?",
    "What's the difference between your starting allocation and the recommended one?",
    "Why does time horizon matter when choosing between stocks and bonds?",
    "If you needed the money in 2 years instead of 10, what would you change?",
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Your Results Summary</h1>
      <p className="text-slate-500 text-sm mb-8">
        Here&rsquo;s everything you built — a great starting point for real financial planning.
      </p>

      {/* Investor profile */}
      {profile && quizResult && (
        <Card className="mb-4">
          <p className="text-xs text-slate-500 mb-1">Investor Profile</p>
          <p className="text-xl font-bold text-slate-900 mb-1">{profile.title}</p>
          <p className="text-sm text-slate-600 mb-2">{profile.description}</p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Risk Score:</span>
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${quizResult.score}%` }}
              />
            </div>
            <span className="text-sm font-bold text-slate-700">{quizResult.score}/100</span>
          </div>
        </Card>
      )}

      {/* Goal */}
      {goalPlan && (
        <Card className="mb-4">
          <p className="text-xs text-slate-500 mb-1">Your Goal</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-slate-500">Type</p>
              <p className="font-semibold capitalize">{goalPlan.goalType.replace("_", " ")}</p>
            </div>
            <div>
              <p className="text-slate-500">Target</p>
              <p className="font-semibold">{formatCurrency(goalPlan.targetAmount)}</p>
            </div>
            <div>
              <p className="text-slate-500">Time Horizon</p>
              <p className="font-semibold">{goalPlan.timeHorizon} years</p>
            </div>
            <div>
              <p className="text-slate-500">Monthly</p>
              <p className="font-semibold">{formatCurrency(goalPlan.monthlyContribution)}/mo</p>
            </div>
          </div>
        </Card>
      )}

      {/* Portfolio */}
      {portfolio && (
        <Card className="mb-4">
          <p className="text-xs text-slate-500 mb-2">Your Portfolio Allocation</p>
          <div className="flex flex-col gap-2">
            {(Object.entries(portfolio.allocation) as [string, number][]).map(([key, pct]) => (
              <div key={key} className="flex items-center gap-2">
                <span className="text-sm capitalize w-24 text-slate-600">
                  {key.replace(/([A-Z])/g, " $1")}
                </span>
                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-sm font-semibold w-8 text-right">{pct}%</span>
              </div>
            ))}
          </div>
          {recommended && (
            <p className="text-xs text-slate-400 mt-3">
              Recommended for your profile: Stocks {recommended.stocks}% · Bonds {recommended.bonds}% · Mutual {recommended.mutualFunds}% · Index {recommended.indexFunds}%
            </p>
          )}
        </Card>
      )}

      {/* Simulation outcome */}
      {simulationResult && scenario && (
        <Card className="mb-4 bg-emerald-50 border-emerald-100">
          <p className="text-xs text-emerald-700 mb-1">Simulation: {scenario.name}</p>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <p className="text-emerald-700">Final Value</p>
              <p className="font-bold text-emerald-900">{formatCurrency(simulationResult.finalValue)}</p>
            </div>
            <div>
              <p className="text-emerald-700">Contributed</p>
              <p className="font-bold text-emerald-900">{formatCurrency(simulationResult.totalContributed)}</p>
            </div>
            <div>
              <p className="text-emerald-700">Growth</p>
              <p className={`font-bold ${simulationResult.totalGrowth >= 0 ? "text-emerald-900" : "text-red-600"}`}>
                {simulationResult.totalGrowth >= 0 ? "+" : ""}
                {formatCurrency(simulationResult.totalGrowth)}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Reflection questions */}
      <Card className="mb-6 bg-blue-50 border-blue-100">
        <p className="text-sm font-semibold text-blue-800 mb-3">
          💭 Reflect on these questions
        </p>
        <ol className="list-decimal list-inside flex flex-col gap-2">
          {REFLECTION_QUESTIONS.map((q) => (
            <li key={q} className="text-sm text-blue-700">{q}</li>
          ))}
        </ol>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/simulation" className="flex-1">
          <Button fullWidth variant="secondary">Try Another Scenario</Button>
        </Link>
        <Link href="/dashboard" className="flex-1">
          <Button fullWidth>Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
