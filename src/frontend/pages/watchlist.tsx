"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/frontend/context/AppContext";
import { getMarketPrices, STOCK_LIST } from "@/frontend/lib/marketData";
import type { WatchlistItem } from "@/types";

type MarketStock = ReturnType<typeof getMarketPrices>[number];

function fmt(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function WatchlistPage() {
  const { user } = useApp();
  const router   = useRouter();

  const [watchlist, setWatchlist]   = useState<WatchlistItem[]>([]);
  const [search, setSearch]         = useState("");
  const [loading, setLoading]       = useState(true);
  const [adding, setAdding]         = useState<string | null>(null);
  const [removing, setRemoving]     = useState<string | null>(null);
  const [toast, setToast]           = useState<{ msg: string; ok: boolean } | null>(null);

  const prices  = getMarketPrices();
  const priceMap = new Map(prices.map((p) => [p.symbol, p]));

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchWatchlist = useCallback(async () => {
    const res = await fetch("/api/watchlist", { credentials: "same-origin" });
    if (res.ok) {
      const data = await res.json() as WatchlistItem[];
      setWatchlist(Array.isArray(data) ? data : []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    fetchWatchlist();
  }, [user, router, fetchWatchlist]);

  async function addToWatchlist(symbol: string) {
    setAdding(symbol);
    try {
      const res  = await fetch("/api/watchlist", {
        method:      "POST",
        credentials: "same-origin",
        headers:     { "Content-Type": "application/json" },
        body:        JSON.stringify({ symbol }),
      });
      const data = await res.json() as { item?: WatchlistItem; error?: string };
      if (res.ok && data.item) {
        setWatchlist((prev) => [data.item as WatchlistItem, ...prev]);
        showToast(`${symbol} added to watchlist`, true);
      } else {
        showToast(data.error ?? "Failed to add.", false);
      }
    } catch {
      showToast("Network error.", false);
    } finally {
      setAdding(null);
    }
  }

  async function removeFromWatchlist(symbol: string) {
    setRemoving(symbol);
    try {
      const res = await fetch("/api/watchlist", {
        method:      "DELETE",
        credentials: "same-origin",
        headers:     { "Content-Type": "application/json" },
        body:        JSON.stringify({ symbol }),
      });
      if (res.ok) {
        setWatchlist((prev) => prev.filter((w) => w.symbol !== symbol));
        showToast(`${symbol} removed from watchlist`, true);
      }
    } catch {
      showToast("Network error.", false);
    } finally {
      setRemoving(null);
    }
  }

  if (!user) return null;

  const watchlistSymbols = new Set(watchlist.map((w) => w.symbol));

  const filteredStocks: MarketStock[] = search.trim()
    ? prices.filter(
        (s) =>
          s.symbol.toLowerCase().includes(search.toLowerCase()) ||
          s.name.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 pb-24">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">My Watchlist</h1>
        <p className="text-slate-500 text-sm mt-1">Track stocks you&rsquo;re interested in</p>
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

      {/* Search to add stocks */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-6">
        <h2 className="font-semibold text-slate-800 mb-3">Add Stocks</h2>
        <input
          type="text"
          placeholder="Search by symbol or name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 mb-2"
        />
        {filteredStocks.length > 0 && (
          <div className="divide-y divide-slate-50 max-h-64 overflow-y-auto">
            {filteredStocks.map((s) => {
              const inWatchlist = watchlistSymbols.has(s.symbol);
              return (
                <div key={s.symbol} className="flex items-center justify-between py-2.5 px-1">
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-sm text-slate-900 mr-2">{s.symbol}</span>
                    <span className="text-xs text-slate-500 mr-2 truncate">{s.name}</span>
                    <span className="px-1.5 py-0.5 text-xs bg-slate-100 text-slate-500 rounded-md">{s.sector}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900">{fmt(s.price)}</p>
                      <p className={["text-xs", s.changePct >= 0 ? "text-emerald-600" : "text-red-500"].join(" ")}>
                        {s.changePct >= 0 ? "+" : ""}{s.changePct}%
                      </p>
                    </div>
                    <button
                      onClick={() => addToWatchlist(s.symbol)}
                      disabled={inWatchlist || adding === s.symbol}
                      className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {inWatchlist ? "Added" : adding === s.symbol ? "Adding…" : "+ Add"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {search.trim() && filteredStocks.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-3">No stocks match your search.</p>
        )}
        {!search.trim() && (
          <p className="text-xs text-slate-400">Type a symbol or company name to search {STOCK_LIST.length} available stocks</p>
        )}
      </div>

      {/* Watchlist */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-800">Watching</h2>
          <span className="text-xs text-slate-400">{watchlist.length} stocks</span>
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : watchlist.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">
            No stocks in your watchlist yet. Search above to add some!
          </p>
        ) : (
          <div className="divide-y divide-slate-50">
            {watchlist.map((item) => {
              const market = priceMap.get(item.symbol);
              return (
                <div key={item.symbol} className="flex items-center justify-between py-3 px-1">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-sm text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg">{item.symbol}</span>
                      <span className="text-sm text-slate-700 truncate">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">{item.sector}</span>
                      <span className="text-xs text-slate-300">·</span>
                      <span className="text-xs text-slate-400">
                        Added {new Date(item.addedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {market && (
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-900">{fmt(market.price)}</p>
                        <p className={["text-xs font-medium", market.changePct >= 0 ? "text-emerald-600" : "text-red-500"].join(" ")}>
                          {market.changePct >= 0 ? "+" : ""}{market.changePct}%
                        </p>
                      </div>
                    )}
                    <button
                      onClick={() => removeFromWatchlist(item.symbol)}
                      disabled={removing === item.symbol}
                      className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 disabled:opacity-50 transition-colors"
                    >
                      {removing === item.symbol ? "…" : "Remove"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Badge hint */}
      {watchlist.length > 0 && watchlist.length < 5 && (
        <div className="mt-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
          Add {5 - watchlist.length} more stock{5 - watchlist.length !== 1 ? "s" : ""} to earn the Market Watcher badge!
        </div>
      )}
    </main>
  );
}
