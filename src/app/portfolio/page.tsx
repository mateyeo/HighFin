"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/frontend/context/AppContext";
import type { AssetAllocation, Portfolio } from "@/types";
import { RECOMMENDED_ALLOCATIONS } from "@/frontend/lib/quiz";
import Button from "@/frontend/components/ui/Button";
import Card from "@/frontend/components/ui/Card";
import Tooltip from "@/frontend/components/ui/Tooltip";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";

const ASSET_COLORS: Record<keyof AssetAllocation, string> = {
  stocks:      "#10b981",
  bonds:       "#3b82f6",
  mutualFunds: "#f59e0b",
  indexFunds:  "#8b5cf6",
};

const ASSET_INFO: Record<keyof AssetAllocation, { label: string; explanation: string }> = {
  stocks:      { label: "Stocks",       explanation: "Ownership shares in companies. Higher risk, higher potential returns." },
  bonds:       { label: "Bonds",        explanation: "Loans to companies or governments. Lower risk, steadier income." },
  mutualFunds: { label: "Mutual Funds", explanation: "Professionally managed bundle of investments. Instant diversification." },
  indexFunds:  { label: "Index Funds",  explanation: "Automatically tracks a market index like the S&P 500. Low fees, proven returns." },
};

const TEMPLATES: { label: string; allocation: AssetAllocation }[] = [
  { label: "Conservative",  allocation: { stocks: 20, bonds: 50, mutualFunds: 20, indexFunds: 10 } },
  { label: "Balanced",      allocation: { stocks: 30, bonds: 30, mutualFunds: 20, indexFunds: 20 } },
  { label: "Growth",        allocation: { stocks: 40, bonds: 15, mutualFunds: 15, indexFunds: 30 } },
  { label: "Aggressive",    allocation: { stocks: 55, bonds: 5,  mutualFunds: 10, indexFunds: 30 } },
];

function clamp(v: number) { return Math.max(0, Math.min(100, v)); }

export default function PortfolioPage() {
  const { user, quizResult, goalPlan, portfolio, setPortfolio } = useApp();
  const router = useRouter();

  const recommended = quizResult ? RECOMMENDED_ALLOCATIONS[quizResult.riskProfile] : null;
  const initial: AssetAllocation = portfolio?.allocation ?? recommended ?? { stocks: 30, bonds: 30, mutualFunds: 20, indexFunds: 20 };

  const [alloc, setAlloc] = useState<AssetAllocation>(initial);

  if (!user) { router.replace("/onboarding"); return null; }
  if (!goalPlan) { router.replace("/goal"); return null; }

  const total = alloc.stocks + alloc.bonds + alloc.mutualFunds + alloc.indexFunds;
  const isValid = total === 100;

  function updateAlloc(key: keyof AssetAllocation, value: number) {
    setAlloc((prev) => ({ ...prev, [key]: clamp(value) }));
  }

  function applyTemplate(t: AssetAllocation) {
    setAlloc({ ...t });
  }

  function handleSave() {
    const p: Portfolio = {
      userId: user!.id,
      allocation: alloc,
      simulationValue: 0,
      scenarioId: "steady",
      updatedAt: new Date().toISOString(),
    };
    setPortfolio(p);
    router.push("/simulation");
  }

  const pieData = (Object.keys(alloc) as (keyof AssetAllocation)[]).map((k) => ({
    name: ASSET_INFO[k].label,
    value: alloc[k],
    color: ASSET_COLORS[k],
  }));

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Build Your Portfolio</h1>
      <p className="text-slate-500 text-sm mb-6">
        Decide how to split your virtual investment money across different asset types.
        Make sure your allocations add up to 100%.
      </p>

      {/* Templates */}
      <div className="mb-6">
        <p className="text-sm font-semibold text-slate-700 mb-3">Start with a template</p>
        <div className="flex flex-wrap gap-2">
          {TEMPLATES.map((t) => (
            <button
              key={t.label}
              type="button"
              onClick={() => applyTemplate(t.allocation)}
              className="px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white hover:border-emerald-400 hover:bg-emerald-50 transition-all font-medium text-slate-700"
            >
              {t.label}
            </button>
          ))}
          {recommended && (
            <button
              type="button"
              onClick={() => applyTemplate(recommended)}
              className="px-3 py-2 text-sm rounded-xl border-2 border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold transition-all"
            >
              ✓ My Profile ({quizResult?.riskProfile})
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Sliders */}
        <Card>
          {(Object.keys(alloc) as (keyof AssetAllocation)[]).map((key) => (
            <div key={key} className="mb-5 last:mb-0">
              <div className="flex items-center justify-between mb-1">
                <Tooltip term={ASSET_INFO[key].label}>
                  {ASSET_INFO[key].explanation}
                </Tooltip>
                <span
                  className="text-sm font-bold"
                  style={{ color: ASSET_COLORS[key] }}
                >
                  {alloc[key]}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={alloc[key]}
                onChange={(e) => updateAlloc(key, Number(e.target.value))}
                className="w-full"
                style={{ accentColor: ASSET_COLORS[key] }}
              />
            </div>
          ))}

          <div
            className={[
              "mt-4 p-3 rounded-xl text-sm font-semibold text-center",
              isValid ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600",
            ].join(" ")}
          >
            Total: {total}% {isValid ? "✓ Perfect!" : `— adjust by ${100 - total > 0 ? "+" : ""}${100 - total}%`}
          </div>
        </Card>

        {/* Pie chart */}
        <Card className="flex flex-col items-center justify-center">
          <p className="text-sm font-semibold text-slate-700 mb-3">Your allocation</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="value"
              >
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip
                formatter={(value) => [`${value}%`]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center mt-2">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center gap-1 text-xs text-slate-600">
                <span className="w-3 h-3 rounded-full inline-block" style={{ background: d.color }} />
                {d.name}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Why diversify? */}
      <Card className="mb-6 bg-blue-50 border-blue-100">
        <p className="text-sm font-semibold text-blue-800 mb-1">Why mix different assets?</p>
        <p className="text-sm text-blue-700">
          <Tooltip term="Diversification">Spreading your money across different investment types reduces the chance that one bad investment wipes out your whole portfolio.</Tooltip>
          {" "}means if stocks drop, your bonds or funds may hold steady. A good mix balances risk and potential reward.
        </p>
      </Card>

      <Button
        fullWidth
        size="lg"
        onClick={handleSave}
        disabled={!isValid}
      >
        Save Portfolio &amp; Run Simulation →
      </Button>
    </div>
  );
}
