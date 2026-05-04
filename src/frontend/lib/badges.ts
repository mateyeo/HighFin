export interface BadgeDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocksLevel?: number;
  hint: string;
  color: string; // tailwind bg color class for earned state
}

export const BADGE_DEFS: Record<string, BadgeDef> = {
  SIMULATION_COMPLETE: {
    id: "SIMULATION_COMPLETE",
    name: "Simulation Graduate",
    description: "Completed the full investment simulation — risk quiz, goal planning, portfolio building, and your first simulation run.",
    icon: "🎓",
    unlocksLevel: 2,
    hint: "Complete a full simulation run to earn this badge",
    color: "bg-emerald-50 border-emerald-200",
  },
  FIRST_TRADE: {
    id: "FIRST_TRADE",
    name: "First Trade",
    description: "Placed your first simulated stock trade in Level 2.",
    icon: "📈",
    hint: "Place your first trade in Level 2 to earn this",
    color: "bg-blue-50 border-blue-200",
  },
  DIVERSIFIED: {
    id: "DIVERSIFIED",
    name: "Diversified",
    description: "Built a trading portfolio with positions in 4 or more different stocks.",
    icon: "🌐",
    hint: "Hold 4+ different stocks simultaneously",
    color: "bg-violet-50 border-violet-200",
  },
  MARKET_WATCHER: {
    id: "MARKET_WATCHER",
    name: "Market Watcher",
    description: "Added 5 or more stocks to your personal watchlist.",
    icon: "🔭",
    hint: "Add 5 stocks to your watchlist",
    color: "bg-amber-50 border-amber-200",
  },
};
