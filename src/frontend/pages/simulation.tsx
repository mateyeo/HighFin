"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/frontend/context/AppContext";
import { runSimulation, SCENARIOS } from "@/frontend/lib/simulation";
import type { ScenarioId } from "@/types";
import Button from "@/frontend/components/ui/Button";
import Card from "@/frontend/components/ui/Card";
import Tooltip from "@/frontend/components/ui/Tooltip";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

function formatCurrency(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

const INITIAL_INVESTMENT = 1000;

export default function SimulationPage() {
  const { user, portfolio, goalPlan, setSimulationResult, simulationResult } = useApp();
  const router = useRouter();

  const [scenarioId, setScenarioId] = useState<ScenarioId>(
    (simulationResult?.scenarioId as ScenarioId) ?? "steady"
  );
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(simulationResult);

  if (!user) { router.replace("/login"); return null; }
  if (!portfolio) { router.replace("/portfolio"); return null; }

  const monthly = goalPlan?.monthlyContribution ?? 200;

  function handleRun() {
    setRunning(true);
    setTimeout(() => {
      const r = runSimulation(
        portfolio!.allocation,
        monthly,
        INITIAL_INVESTMENT,
        scenarioId,
        10
      );
      setResult(r);
      setSimulationResult(r);
      setRunning(false);
    }, 600);
  }

  useEffect(() => {
    if (!result) handleRun();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chartData = result
    ? result.years.map((y) => ({
        year: `Year ${y.year}`,
        value: y.value,
        contributed: (goalPlan?.monthlyContribution ?? 200) * 12 * y.year + INITIAL_INVESTMENT,
      }))
    : [];

  const goal = goalPlan?.targetAmount ?? 0;
  const finalValue = result?.finalValue ?? 0;
  const goalMet = finalValue >= goal;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Run Your Simulation</h1>
      <p className="text-slate-500 text-sm mb-6">
        See how your portfolio might perform over 10 years under different market conditions.
        This is a simulation using historical patterns — not a prediction.
      </p>

      {/* Scenario selector */}
      <div className="mb-6">
        <p className="text-sm font-semibold text-slate-700 mb-3">Choose a market scenario</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(Object.keys(SCENARIOS) as ScenarioId[]).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setScenarioId(id)}
              className={[
                "text-left p-4 rounded-2xl border-2 transition-all",
                scenarioId === id
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-slate-200 bg-white hover:border-slate-300",
              ].join(" ")}
            >
              <p className="font-semibold text-slate-800 text-sm">{SCENARIOS[id].name}</p>
              <p className="text-xs text-slate-500 mt-1">{SCENARIOS[id].description}</p>
            </button>
          ))}
        </div>
      </div>

      <Button fullWidth size="lg" onClick={handleRun} disabled={running} className="mb-6">
        {running ? "Running simulation…" : "Run Simulation →"}
      </Button>

      {result && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: "Final Value",     value: formatCurrency(result.finalValue) },
              { label: "Total Invested",  value: formatCurrency(result.totalContributed) },
              { label: "Total Growth",    value: formatCurrency(result.totalGrowth) },
              { label: "Goal Progress",   value: goal > 0 ? `${Math.min(Math.round((result.finalValue / goal) * 100), 999)}%` : "N/A" },
            ].map((s) => (
              <Card key={s.label} padding="sm" className="text-center">
                <p className="text-xs text-slate-500 mb-1">{s.label}</p>
                <p
                  className={[
                    "font-bold text-sm",
                    s.label === "Total Growth" && result.totalGrowth > 0
                      ? "text-emerald-600"
                      : s.label === "Total Growth"
                      ? "text-red-600"
                      : "text-slate-900",
                  ].join(" ")}
                >
                  {s.value}
                </p>
              </Card>
            ))}
          </div>

          {/* Goal status */}
          {goal > 0 && (
            <Card
              className={`mb-6 ${goalMet ? "bg-emerald-50 border-emerald-100" : "bg-amber-50 border-amber-100"}`}
            >
              <p className={`font-semibold text-sm ${goalMet ? "text-emerald-800" : "text-amber-800"}`}>
                {goalMet
                  ? `🎉 You reached your ${formatCurrency(goal)} goal!`
                  : `You're ${formatCurrency(goal - finalValue)} away from your ${formatCurrency(goal)} goal.`}
              </p>
              <p className={`text-xs mt-1 ${goalMet ? "text-emerald-700" : "text-amber-700"}`}>
                {goalMet
                  ? "Great portfolio and contribution consistency!"
                  : "Try increasing monthly contributions or adjusting your allocation."}
              </p>
            </Card>
          )}

          {/* Chart */}
          <Card className="mb-6">
            <p className="text-sm font-semibold text-slate-700 mb-4">Portfolio value over 10 years</p>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="valueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="contribGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v: number) =>
                    v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`
                  }
                />
                <RechartsTooltip
                  formatter={(value, name) => [
                    formatCurrency(Number(value)),
                    name === "value" ? "Portfolio Value" : "Amount Contributed",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="contributed"
                  stroke="#3b82f6"
                  fill="url(#contribGrad)"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#10b981"
                  fill="url(#valueGrad)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
            <p className="text-xs text-slate-400 mt-2 text-center">
              Green line = portfolio value · Blue dashed = total contributions
            </p>
          </Card>

          {/* Year-by-year table */}
          <Card className="mb-6">
            <p className="text-sm font-semibold text-slate-700 mb-3">Year-by-year breakdown</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-500 border-b border-slate-100">
                    <th className="pb-2 pr-3">Year</th>
                    <th className="pb-2 pr-3">Value</th>
                    <th className="pb-2 pr-3">Contributed</th>
                    <th className="pb-2">Growth</th>
                  </tr>
                </thead>
                <tbody>
                  {result.years.map((y) => (
                    <tr key={y.year} className="border-b border-slate-50 last:border-0">
                      <td className="py-2 pr-3 text-slate-600">Yr {y.year}</td>
                      <td className="py-2 pr-3 font-semibold text-slate-900">{formatCurrency(y.value)}</td>
                      <td className="py-2 pr-3 text-slate-500">{formatCurrency(y.contribution)}</td>
                      <td
                        className={`py-2 font-medium ${
                          y.growth >= 0 ? "text-emerald-600" : "text-red-500"
                        }`}
                      >
                        {y.growth >= 0 ? "+" : ""}
                        {formatCurrency(y.growth)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Educational callout */}
          <Card className="mb-6 bg-purple-50 border-purple-100">
            <p className="text-sm font-semibold text-purple-800 mb-1">
              What is{" "}
              <Tooltip term="compound growth">
                Your earnings also earn returns. A $100 gain in year 1 grows further in year 2 — this snowballs over time.
              </Tooltip>
              ?
            </p>
            <p className="text-sm text-purple-700">
              Notice how the gap between your contributions and portfolio value widens each year?
              That&rsquo;s compound growth at work — your investment earnings are themselves earning returns.
              The longer you stay invested, the more powerful this effect becomes.
            </p>
          </Card>

          {/* bottom spacer so sticky bar doesn't overlap last card */}
          <div className="h-24 md:h-20" />
        </>
      )}

      {/* Sticky action bar — always visible when a result is shown */}
      {result && (
        <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-sm border-t border-slate-200 px-4 py-3 shadow-lg">
          <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3">
            <Button fullWidth variant="secondary" onClick={() => router.push("/portfolio")}>
              ← Adjust Portfolio
            </Button>
            <Button fullWidth onClick={() => router.push("/results")}>
              View Full Results →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
