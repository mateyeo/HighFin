"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/frontend/context/AppContext";
import { getMarketPrices } from "@/frontend/lib/marketData";
import type { TradingAccount, TradeOrder } from "@/types";

type MarketStock = ReturnType<typeof getMarketPrices>[number];

function fmt(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtShort(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export default function TradePage() {
  const { user } = useApp();
  const router   = useRouter();

  const [account, setAccount]           = useState<TradingAccount | null>(null);
  const [history, setHistory]           = useState<TradeOrder[]>([]);
  const [stocks]                        = useState<MarketStock[]>(() => getMarketPrices());
  const [search, setSearch]             = useState("");
  const [selected, setSelected]         = useState<MarketStock | null>(null);
  const [tradeType, setTradeType]       = useState<"buy" | "sell">("buy");
  const [shares, setShares]             = useState("");
  const [executing, setExecuting]       = useState(false);
  const [toast, setToast]               = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchAccount = useCallback(async () => {
    const res = await fetch("/api/trading/account", { credentials: "same-origin" });
    if (res.ok) setAccount(await res.json() as TradingAccount);
  }, []);

  const fetchHistory = useCallback(async () => {
    const res = await fetch("/api/trading/history", { credentials: "same-origin" });
    if (res.ok) setHistory(await res.json() as TradeOrder[]);
  }, []);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.level < 2) {
      router.replace("/badges");
      return;
    }
    fetchAccount();
    fetchHistory();
  }, [user, router, fetchAccount, fetchHistory]);

  const filteredStocks = stocks.filter(
    (s) =>
      s.symbol.toLowerCase().includes(search.toLowerCase()) ||
      s.name.toLowerCase().includes(search.toLowerCase())
  );

  async function executeTrade() {
    if (!selected || !shares) return;
    const sharesNum = parseInt(shares, 10);
    if (isNaN(sharesNum) || sharesNum <= 0) {
      showToast("Please enter a valid number of shares.", false);
      return;
    }

    setExecuting(true);
    try {
      const res  = await fetch("/api/trading/trade", {
        method:      "POST",
        credentials: "same-origin",
        headers:     { "Content-Type": "application/json" },
        body:        JSON.stringify({ symbol: selected.symbol, type: tradeType, shares: sharesNum }),
      });
      const data = await res.json() as { account?: TradingAccount; trade?: TradeOrder; error?: string };

      if (!res.ok) {
        showToast(data.error ?? "Trade failed.", false);
      } else {
        if (data.account) setAccount(data.account);
        await fetchHistory();
        setShares("");
        showToast(`${tradeType === "buy" ? "Bought" : "Sold"} ${sharesNum} share(s) of ${selected.symbol}`, true);
      }
    } catch {
      showToast("Network error. Please try again.", false);
    } finally {
      setExecuting(false);
    }
  }

  if (!user || user.level < 2) return null;

  const selectedPrice = selected?.price ?? 0;
  const sharesNum     = parseInt(shares, 10);
  const orderTotal    = !isNaN(sharesNum) && sharesNum > 0 ? sharesNum * selectedPrice : 0;

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 pb-28">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Trade Simulation</h1>
        <p className="text-slate-500 text-sm mt-1">Practice trading with $10,000 of simulated cash</p>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={[
            "mb-4 px-4 py-3 rounded-xl text-sm font-medium border",
            toast.ok
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800",
          ].join(" ")}
        >
          {toast.msg}
        </div>
      )}

      {/* Stat cards */}
      {account && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <p className="text-xs text-slate-500 mb-1">Cash Balance</p>
            <p className="text-lg font-bold text-slate-900">{fmt(account.cashBalance)}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <p className="text-xs text-slate-500 mb-1">Portfolio Value</p>
            <p className="text-lg font-bold text-slate-900">
              {fmt(account.totalValue - account.cashBalance)}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <p className="text-xs text-slate-500 mb-1">Total Value</p>
            <p className="text-lg font-bold text-slate-900">{fmt(account.totalValue)}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <p className="text-xs text-slate-500 mb-1">Total Gain/Loss</p>
            <p
              className={[
                "text-lg font-bold",
                account.totalGainLoss >= 0 ? "text-emerald-600" : "text-red-600",
              ].join(" ")}
            >
              {account.totalGainLoss >= 0 ? "+" : ""}
              {fmt(account.totalGainLoss)}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Market + Trade Panel */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <h2 className="font-semibold text-slate-800 mb-3">Market</h2>
            <input
              type="text"
              placeholder="Search stocks…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />
            <div className="overflow-y-auto max-h-72 divide-y divide-slate-50">
              {filteredStocks.map((s) => (
                <button
                  key={s.symbol}
                  onClick={() => { setSelected(s); setShares(""); }}
                  className={[
                    "w-full flex items-center justify-between px-2 py-2.5 rounded-xl text-left transition-colors hover:bg-slate-50",
                    selected?.symbol === s.symbol ? "bg-emerald-50 hover:bg-emerald-50" : "",
                  ].join(" ")}
                >
                  <div>
                    <span className="font-semibold text-sm text-slate-900">{s.symbol}</span>
                    <span className="ml-2 text-xs text-slate-500">{s.name}</span>
                    <span className="ml-2 px-1.5 py-0.5 text-xs bg-slate-100 text-slate-500 rounded-md">{s.sector}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-slate-900">{fmt(s.price)}</p>
                    <p className={["text-xs font-medium", s.changePct >= 0 ? "text-emerald-600" : "text-red-500"].join(" ")}>
                      {s.changePct >= 0 ? "+" : ""}{s.changePct}%
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Trade form */}
          {selected && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="font-semibold text-slate-800">{selected.symbol}</h2>
                  <p className="text-xs text-slate-500">{selected.name}</p>
                </div>
                <p className="text-xl font-bold text-slate-900">{fmt(selected.price)}</p>
              </div>

              {/* Buy / Sell toggle */}
              <div className="flex rounded-xl border border-slate-200 overflow-hidden mb-4">
                <button
                  onClick={() => setTradeType("buy")}
                  className={[
                    "flex-1 py-2 text-sm font-semibold transition-colors",
                    tradeType === "buy"
                      ? "bg-emerald-600 text-white"
                      : "bg-white text-slate-600 hover:bg-slate-50",
                  ].join(" ")}
                >
                  Buy
                </button>
                <button
                  onClick={() => setTradeType("sell")}
                  className={[
                    "flex-1 py-2 text-sm font-semibold transition-colors",
                    tradeType === "sell"
                      ? "bg-red-500 text-white"
                      : "bg-white text-slate-600 hover:bg-slate-50",
                  ].join(" ")}
                >
                  Sell
                </button>
              </div>

              <label className="block text-xs text-slate-500 mb-1">Shares</label>
              <input
                type="number"
                min="1"
                step="1"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              />

              {orderTotal > 0 && (
                <div className="flex justify-between text-sm mb-4">
                  <span className="text-slate-500">Estimated Total</span>
                  <span className="font-semibold text-slate-900">{fmt(orderTotal)}</span>
                </div>
              )}

              <button
                onClick={executeTrade}
                disabled={executing || !shares || parseInt(shares, 10) <= 0}
                className={[
                  "w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-50",
                  tradeType === "buy" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-500 hover:bg-red-600",
                ].join(" ")}
              >
                {executing ? "Executing…" : `Execute ${tradeType === "buy" ? "Buy" : "Sell"}`}
              </button>
            </div>
          )}
        </div>

        {/* Right: Portfolio + History */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Positions */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <h2 className="font-semibold text-slate-800 mb-3">My Positions</h2>
            {!account || account.positions.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No positions yet — buy your first stock!</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-slate-400 border-b border-slate-100">
                      <th className="pb-2 pr-2">Symbol</th>
                      <th className="pb-2 pr-2">Shares</th>
                      <th className="pb-2 pr-2">Avg Cost</th>
                      <th className="pb-2 pr-2">Price</th>
                      <th className="pb-2 pr-2">Value</th>
                      <th className="pb-2">G/L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {account.positions.map((pos) => (
                      <tr key={pos.symbol} className="border-b border-slate-50 last:border-0">
                        <td className="py-1.5 pr-2 font-semibold text-slate-900">{pos.symbol}</td>
                        <td className="py-1.5 pr-2 text-slate-600">{pos.shares}</td>
                        <td className="py-1.5 pr-2 text-slate-600">{fmt(pos.avgCost)}</td>
                        <td className="py-1.5 pr-2 text-slate-600">{fmt(pos.currentPrice)}</td>
                        <td className="py-1.5 pr-2 font-medium text-slate-900">{fmtShort(pos.value)}</td>
                        <td className={["py-1.5 font-medium", pos.gainLoss >= 0 ? "text-emerald-600" : "text-red-500"].join(" ")}>
                          {pos.gainLoss >= 0 ? "+" : ""}{fmt(pos.gainLoss)}
                          <span className="block text-slate-400">
                            ({pos.gainLossPct >= 0 ? "+" : ""}{pos.gainLossPct}%)
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Trade History */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <h2 className="font-semibold text-slate-800 mb-3">Trade History</h2>
            {history.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No trades yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-slate-400 border-b border-slate-100">
                      <th className="pb-2 pr-2">Date</th>
                      <th className="pb-2 pr-2">Symbol</th>
                      <th className="pb-2 pr-2">Type</th>
                      <th className="pb-2 pr-2">Shares</th>
                      <th className="pb-2 pr-2">Price</th>
                      <th className="pb-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.slice(0, 10).map((t) => (
                      <tr key={t.id} className="border-b border-slate-50 last:border-0">
                        <td className="py-1.5 pr-2 text-slate-400">
                          {new Date(t.executedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </td>
                        <td className="py-1.5 pr-2 font-semibold text-slate-900">{t.symbol}</td>
                        <td className="py-1.5 pr-2">
                          <span
                            className={[
                              "px-1.5 py-0.5 rounded-md font-semibold uppercase text-xs",
                              t.type === "buy"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-red-100 text-red-700",
                            ].join(" ")}
                          >
                            {t.type}
                          </span>
                        </td>
                        <td className="py-1.5 pr-2 text-slate-600">{t.shares}</td>
                        <td className="py-1.5 pr-2 text-slate-600">{fmt(t.price)}</td>
                        <td className="py-1.5 font-medium text-slate-900">{fmt(t.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
