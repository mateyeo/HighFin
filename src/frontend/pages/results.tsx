"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useApp } from "@/frontend/context/AppContext";
import { PROFILE_DESCRIPTIONS, RECOMMENDED_ALLOCATIONS } from "@/frontend/lib/quiz";
import { SCENARIOS } from "@/frontend/lib/simulation";
import Button from "@/frontend/components/ui/Button";
import Card from "@/frontend/components/ui/Card";
import { APP_URL } from "@/frontend/lib/config";

const PRINT_CSS = `
/* ─── Screen: hide print-only elements ─────────────────────────── */
.print-report-header,
.print-report-footer { display: none; }

/* ─── Print ─────────────────────────────────────────────────────── */
@media print {

  @page {
    size: letter portrait;
    margin: 0.55in 0.70in 0.80in 0.70in;
  }

  html {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  body {
    background: #ffffff !important;
    font-family: -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif;
    color: #1a2744;
    margin: 0;
    padding: 0;
  }

  main { padding: 0 !important; }
  * { box-shadow: none !important; }

  /* ── Kill screen chrome ── */
  .no-print { display: none !important; }
  header    { display: none !important; }
  nav       { display: none !important; }

  /* ── Reveal print elements ── */
  .print-report-header { display: block !important; }
  .print-report-footer { display: block !important; }

  /* ── Container reset ── */
  .max-w-2xl {
    max-width: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  /* ══════════════════════════════════════════════
     REPORT HEADER
  ══════════════════════════════════════════════ */
  .prh-top-rule {
    height: 5pt;
    background: #0B1F3A;
    margin-bottom: 14pt;
  }
  .prh-bar {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    padding-bottom: 11pt;
    border-bottom: 0.75pt solid #CBD5E0;
    margin-bottom: 6pt;
  }
  .prh-logo {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 26pt;
    font-weight: 700;
    color: #0B1F3A;
    letter-spacing: -1pt;
    line-height: 1;
    display: block;
  }
  .prh-tagline {
    font-size: 6pt;
    letter-spacing: 2.5pt;
    text-transform: uppercase;
    color: #94A3B8;
    display: block;
    margin-top: 4pt;
  }
  .prh-title {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 12pt;
    font-weight: 400;
    color: #0B1F3A;
    display: block;
    text-align: right;
    margin-bottom: 3pt;
    letter-spacing: 0.3pt;
  }
  .prh-sub {
    font-size: 7.5pt;
    color: #64748B;
    display: block;
    text-align: right;
  }
  .prh-gold-rule {
    height: 1.5pt;
    background: linear-gradient(to right, #C9A84C, #E8D5A3 55%, transparent 100%);
    margin-bottom: 20pt;
  }

  /* ══════════════════════════════════════════════
     SECTION CARDS
  ══════════════════════════════════════════════ */
  .print-section {
    background: #ffffff !important;
    border: none !important;
    border-left: 3pt solid #C9A84C !important;
    border-radius: 0 !important;
    padding: 9pt 14pt 10pt 12pt !important;
    margin-bottom: 13pt !important;
    page-break-inside: avoid;
  }

  .print-label {
    font-size: 5.5pt !important;
    font-weight: 700 !important;
    letter-spacing: 2.5pt !important;
    text-transform: uppercase !important;
    color: #94A3B8 !important;
    margin-bottom: 6pt !important;
    display: block !important;
  }

  /* Section main title (profile name, goal type) */
  .print-section .text-xl {
    font-family: Georgia, serif !important;
    font-size: 13pt !important;
    font-weight: 700 !important;
    color: #0B1F3A !important;
    margin-bottom: 3pt !important;
  }

  /* Body copy */
  .print-section p,
  .print-section span,
  .print-section li {
    font-size: 8.5pt !important;
    color: #334155 !important;
    line-height: 1.55 !important;
  }

  /* Sub-labels ("Type", "Target", "Time Horizon", "Monthly") */
  .print-section .text-slate-500:not(.print-label) {
    font-size: 6pt !important;
    letter-spacing: 1pt !important;
    text-transform: uppercase !important;
    color: #94A3B8 !important;
    font-weight: 700 !important;
  }

  .print-section .font-semibold,
  .print-section .font-bold {
    color: #0B1F3A !important;
    font-size: 9.5pt !important;
  }

  /* ── Risk score bar: hide visual, keep text ── */
  .print-section .flex-1.h-2 { display: none !important; }

  /* ── Portfolio allocation bars ── */
  .print-section .bg-emerald-500 {
    background-color: #0B1F3A !important;
  }
  .print-section .bg-slate-100.h-3 {
    background-color: #EDF2F7 !important;
  }
  .print-section .w-8.text-right {
    font-weight: 700 !important;
    font-size: 9pt !important;
    color: #0B1F3A !important;
  }
  .print-section .capitalize.w-24 {
    color: #334155 !important;
    font-size: 8.5pt !important;
  }

  /* ══════════════════════════════════════════════
     SIMULATION OUTCOME CARD
  ══════════════════════════════════════════════ */
  .print-outcome {
    background: #F8FAFB !important;
    border-left: 3pt solid #0B1F3A !important;
  }
  .print-outcome .text-emerald-700 {
    color: #1E3A5F !important;
  }
  .print-outcome .font-bold.text-emerald-900 {
    font-family: Georgia, serif !important;
    font-size: 14pt !important;
    color: #0B1F3A !important;
  }
  .print-outcome .text-red-600 { color: #991B1B !important; }
  .print-outcome .grid.grid-cols-3 {
    display: flex !important;
    gap: 0 !important;
  }
  .print-outcome .grid.grid-cols-3 > div {
    flex: 1;
    border-right: 0.5pt solid #E2E8F0;
    padding: 0 10pt !important;
  }
  .print-outcome .grid.grid-cols-3 > div:first-child { padding-left: 0 !important; }
  .print-outcome .grid.grid-cols-3 > div:last-child { border-right: none !important; }

  /* ══════════════════════════════════════════════
     TABLE
  ══════════════════════════════════════════════ */
  .print-section table {
    width: 100% !important;
    border-collapse: collapse !important;
    margin-top: 2pt !important;
  }
  .print-section thead tr {
    border-bottom: 1pt solid #0B1F3A !important;
  }
  .print-section th {
    font-size: 6pt !important;
    letter-spacing: 1.5pt !important;
    text-transform: uppercase !important;
    color: #64748B !important;
    font-weight: 700 !important;
    padding: 0 10pt 7pt 0 !important;
    text-align: left !important;
  }
  .print-section td {
    font-size: 8.5pt !important;
    padding: 4pt 10pt 4pt 0 !important;
    border-bottom: 0.5pt solid #F1F5F9 !important;
    font-variant-numeric: tabular-nums !important;
    color: #1E293B !important;
  }
  .print-section tr:last-child td { border-bottom: none !important; }
  .print-section td.text-emerald-600 { color: #166534 !important; }
  .print-section td.text-red-500    { color: #991B1B !important; }
  .print-section td.font-semibold   { color: #0B1F3A !important; }
  .print-section td.text-slate-500  { color: #64748B !important; }

  /* ══════════════════════════════════════════════
     REFLECTION CALLOUT
  ══════════════════════════════════════════════ */
  .print-reflect {
    background: #F8FAFB !important;
    border: none !important;
    border-left: 3pt solid #0B1F3A !important;
    border-radius: 0 !important;
    padding: 9pt 14pt 10pt 12pt !important;
    margin-bottom: 12pt !important;
    page-break-inside: avoid;
  }
  .print-reflect .text-blue-800 {
    font-size: 7pt !important;
    font-weight: 700 !important;
    letter-spacing: 1.5pt !important;
    text-transform: uppercase !important;
    color: #0B1F3A !important;
  }
  .print-reflect li {
    font-size: 8.5pt !important;
    color: #334155 !important;
    margin-bottom: 3pt !important;
    line-height: 1.55 !important;
  }

  /* ══════════════════════════════════════════════
     REPORT FOOTER
  ══════════════════════════════════════════════ */
  .print-report-footer {
    display: block !important;
    margin-top: 14pt;
    padding-top: 8pt;
    border-top: 0.75pt solid #CBD5E0;
  }
  .prf-disclaimer {
    font-size: 6.5pt;
    color: #94A3B8;
    line-height: 1.65;
    display: block;
    margin-bottom: 4pt;
  }
  .prf-branding {
    font-size: 5.5pt;
    color: #CBD5E0;
    letter-spacing: 1pt;
    text-transform: uppercase;
    display: block;
  }
}
`;

const ASSET_COLORS: Record<string, string> = {
  stocks:      "#10b981",
  bonds:       "#3b82f6",
  mutualFunds: "#f59e0b",
  indexFunds:  "#8b5cf6",
};

function formatCurrency(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function ExportToolbar({
  onPrint, onShare,
}: {
  onPrint: () => void;
  onShare: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <button
        type="button"
        onClick={onPrint}
        className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
      >
        🖨️ Print / PDF
      </button>
      <button
        type="button"
        onClick={onShare}
        className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
      >
        🔗 Share
      </button>
    </div>
  );
}

export default function ResultsPage() {
  const { user, quizResult, goalPlan, portfolio, simulationResult } = useApp();
  const router = useRouter();
  const [badgeEarned, setBadgeEarned] = useState(false);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    if (simulationResult && user) {
      fetch("/api/badges", {
        method:      "POST",
        credentials: "same-origin",
        headers:     { "Content-Type": "application/json" },
        body:        JSON.stringify({ badgeId: "SIMULATION_COMPLETE" }),
      })
        .then((res) => {
          if (res.status === 201) setBadgeEarned(true);
        })
        .catch(() => {});
    }
  }, [user, simulationResult, router]);

  if (!user) return null;

  const profile     = quizResult ? PROFILE_DESCRIPTIONS[quizResult.riskProfile] : null;
  const recommended = quizResult ? RECOMMENDED_ALLOCATIONS[quizResult.riskProfile] : null;
  const scenario    = simulationResult ? SCENARIOS[simulationResult.scenarioId as keyof typeof SCENARIOS] : null;

  const reportDate = new Date().toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  const REFLECTION_QUESTIONS = [
    "What would happen if you increased your monthly contribution by $50?",
    "How would a bear market change your strategy?",
    "What's the difference between your starting allocation and the recommended one?",
    "Why does time horizon matter when choosing between stocks and bonds?",
    "If you needed the money in 2 years instead of 10, what would you change?",
  ];

  // ── Export helpers ──────────────────────────────────────────────────────

  function handlePrint() {
    window.print();
  }

  async function handleShare() {
    const text = [
      "My HighFin Results",
      profile   ? `Investor Profile: ${profile.title} (Score ${quizResult?.score}/100)` : null,
      goalPlan  ? `Goal: ${goalPlan.goalType} — target ${formatCurrency(goalPlan.targetAmount)} in ${goalPlan.timeHorizon} yrs` : null,
      simulationResult ? `Simulation: Final Value ${formatCurrency(simulationResult.finalValue)}, Growth ${formatCurrency(simulationResult.totalGrowth)}` : null,
      `Try it yourself: ${APP_URL}`,
    ].filter(Boolean).join("\n");

    if (navigator.share) {
      await navigator.share({ title: "My HighFin Results", url: APP_URL, text }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(text);
      alert("Results copied to clipboard!");
    }
  }

return (
    <>
      <style>{PRINT_CSS}</style>

      {/* ── Badge earned banner ──────────────────────────────────────── */}
      {badgeEarned && (
        <div className="no-print bg-emerald-50 border-b border-emerald-200 px-4 py-3 text-center">
          <p className="text-emerald-800 text-sm font-medium">
            🎓 Badge Earned! You&rsquo;ve unlocked the Simulation Graduate badge.{" "}
            <Link href="/badges" className="underline font-semibold hover:text-emerald-900">
              View your badges →
            </Link>
          </p>
        </div>
      )}

      {/* ── Print-only report header ──────────────────────────────────── */}
      <div className="print-report-header">
        <div className="prh-top-rule" />
        <div className="prh-bar">
          <div>
            <span className="prh-logo">HighFin</span>
            <span className="prh-tagline">Investment Simulation Platform</span>
          </div>
          <div>
            <span className="prh-title">Investment Simulation Report</span>
            <span className="prh-sub">Prepared for {user.name} &nbsp;·&nbsp; {reportDate}</span>
          </div>
        </div>
        <div className="prh-gold-rule" />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* ── Screen-only heading ── */}
        <div className="no-print flex items-start justify-between gap-4 mb-2 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Your Results Summary</h1>
            <p className="text-slate-500 text-sm mt-1">
              Here&rsquo;s everything you built — a great starting point for real financial planning.
            </p>
          </div>
        </div>

        <div className="no-print">
          <ExportToolbar
            onPrint={handlePrint}
            onShare={handleShare}
          />
        </div>

        {/* ── Investor profile ── */}
        {profile && quizResult && (
          <Card className="mb-4 print-section">
            <p className="text-xs text-slate-500 mb-1 print-label">Investor Profile</p>
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

        {/* ── Goal ── */}
        {goalPlan && (
          <Card className="mb-4 print-section">
            <p className="text-xs text-slate-500 mb-1 print-label">Your Goal</p>
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

        {/* ── Portfolio ── */}
        {portfolio && (
          <Card className="mb-4 print-section">
            <p className="text-xs text-slate-500 mb-2 print-label">Portfolio Allocation</p>
            <div className="flex flex-col gap-2">
              {(Object.entries(portfolio.allocation) as [string, number][]).map(([key, pct]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="text-sm capitalize w-24 text-slate-600">
                    {key.replace(/([A-Z])/g, " $1")}
                  </span>
                  <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, background: ASSET_COLORS[key] ?? "#10b981" }}
                    />
                  </div>
                  <span
                    className="text-sm font-semibold w-8 text-right"
                    style={{ color: ASSET_COLORS[key] ?? "#10b981" }}
                  >
                    {pct}%
                  </span>
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

        {/* ── Simulation outcome ── */}
        {simulationResult && scenario && (
          <Card className="mb-4 bg-emerald-50 border-emerald-100 print-section print-outcome">
            <p className="text-xs text-emerald-700 mb-3 print-label">
              Simulation Results — {scenario.name}
            </p>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <p className="text-emerald-700 text-xs">Final Value</p>
                <p className="font-bold text-emerald-900 text-base">{formatCurrency(simulationResult.finalValue)}</p>
              </div>
              <div>
                <p className="text-emerald-700 text-xs">Contributed</p>
                <p className="font-bold text-emerald-900 text-base">{formatCurrency(simulationResult.totalContributed)}</p>
              </div>
              <div>
                <p className="text-emerald-700 text-xs">Growth</p>
                <p className={`font-bold text-base ${simulationResult.totalGrowth >= 0 ? "text-emerald-900" : "text-red-600"}`}>
                  {simulationResult.totalGrowth >= 0 ? "+" : ""}
                  {formatCurrency(simulationResult.totalGrowth)}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* ── Year-by-year table ── */}
        {simulationResult && (
          <Card className="mb-4 print-section">
            <p className="text-xs text-slate-500 mb-2 print-label">Year-by-Year Breakdown</p>
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
                  {simulationResult.years.map((y) => (
                    <tr key={y.year} className="border-b border-slate-50 last:border-0">
                      <td className="py-1.5 pr-3 text-slate-500">Yr {y.year}</td>
                      <td className="py-1.5 pr-3 font-semibold">{formatCurrency(y.value)}</td>
                      <td className="py-1.5 pr-3 text-slate-500">{formatCurrency(y.contribution)}</td>
                      <td className={`py-1.5 font-medium ${y.growth >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                        {y.growth >= 0 ? "+" : ""}{formatCurrency(y.growth)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* ── Reflection questions ── */}
        <Card className="mb-6 bg-blue-50 border-blue-100 print-reflect">
          <p className="text-sm font-semibold text-blue-800 mb-3">💭 Reflect on these questions</p>
          <ol className="list-decimal list-inside flex flex-col gap-2">
            {REFLECTION_QUESTIONS.map((q) => (
              <li key={q} className="text-sm text-blue-700">{q}</li>
            ))}
          </ol>
        </Card>

        {/* bottom spacer so sticky bar doesn't overlap last card */}
        <div className="h-24 md:h-20" />
      </div>

      {/* Sticky action bar */}
      <div className="no-print fixed bottom-16 md:bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-sm border-t border-slate-200 px-4 py-3 shadow-lg">
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3">
          <Link href="/simulation" className="flex-1">
            <Button fullWidth variant="secondary">Try Another Scenario</Button>
          </Link>
          <Link href="/dashboard" className="flex-1">
            <Button fullWidth>Back to Dashboard</Button>
          </Link>
        </div>
      </div>

      {/* ── Print-only report footer ──────────────────────────────────── */}
      <div className="print-report-footer">
        <span className="prf-disclaimer">
          This report was generated by HighFin, an educational investment simulation platform.
          All figures shown are projections based on simplified historical market patterns and assumed
          contribution rates. Simulation results do not constitute personalized financial advice.
          Past performance is not indicative of future results. Investment values can decrease as well
          as increase. Please consult a qualified financial advisor before making investment decisions.
        </span>
        <span className="prf-branding">
          © {new Date().getFullYear()} HighFin Educational Platform &nbsp;·&nbsp; Not for commercial redistribution
        </span>
      </div>
    </>
  );
}
