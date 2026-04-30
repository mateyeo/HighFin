import type { AssetAllocation, ScenarioId, SimulationResult, SimulationYear } from "@/types";

// Annual return rates per asset class per scenario (deterministic approximations)
const SCENARIO_RETURNS: Record<ScenarioId, Record<keyof AssetAllocation, number[]>> = {
  steady: {
    stocks:      [0.07, 0.08, 0.07, 0.09, 0.07, 0.08, 0.07, 0.08, 0.09, 0.07],
    bonds:       [0.04, 0.04, 0.03, 0.04, 0.04, 0.03, 0.04, 0.04, 0.03, 0.04],
    mutualFunds: [0.06, 0.06, 0.05, 0.07, 0.06, 0.06, 0.05, 0.06, 0.07, 0.06],
    indexFunds:  [0.07, 0.08, 0.07, 0.09, 0.07, 0.08, 0.07, 0.08, 0.09, 0.07],
  },
  bull: {
    stocks:      [0.20, 0.18, 0.22, 0.15, 0.18, 0.20, 0.17, 0.19, 0.21, 0.16],
    bonds:       [0.04, 0.05, 0.04, 0.05, 0.04, 0.05, 0.04, 0.05, 0.04, 0.05],
    mutualFunds: [0.14, 0.13, 0.15, 0.12, 0.14, 0.13, 0.14, 0.13, 0.15, 0.12],
    indexFunds:  [0.18, 0.17, 0.20, 0.14, 0.17, 0.19, 0.16, 0.18, 0.20, 0.15],
  },
  bear: {
    stocks:      [-0.15, -0.10, -0.08, 0.05, 0.07, -0.05, -0.03, 0.06, 0.08, 0.07],
    bonds:       [0.06,   0.05,  0.06, 0.05, 0.05,  0.06,  0.05, 0.06, 0.05, 0.05],
    mutualFunds: [-0.05, -0.04, -0.03, 0.04, 0.06, -0.02, -0.01, 0.05, 0.06, 0.05],
    indexFunds:  [-0.12, -0.08, -0.06, 0.04, 0.07, -0.04, -0.02, 0.06, 0.08, 0.06],
  },
  volatile: {
    stocks:      [0.25, -0.18, 0.30, -0.20, 0.28, -0.15, 0.22, -0.12, 0.26, 0.18],
    bonds:       [0.04,  0.03,  0.05,  0.03,  0.04,  0.03,  0.05,  0.03,  0.04, 0.04],
    mutualFunds: [0.15, -0.10, 0.18, -0.12, 0.16, -0.08, 0.14, -0.07, 0.15, 0.11],
    indexFunds:  [0.22, -0.16, 0.26, -0.18, 0.24, -0.13, 0.20, -0.10, 0.23, 0.16],
  },
  crash_recovery: {
    stocks:      [-0.35, -0.15, -0.05, 0.20, 0.25, 0.18, 0.15, 0.12, 0.10, 0.09],
    bonds:       [ 0.08,  0.07,  0.06, 0.05, 0.05, 0.04, 0.04, 0.04, 0.04, 0.04],
    mutualFunds: [-0.20, -0.10, -0.02, 0.12, 0.16, 0.12, 0.10, 0.08, 0.07, 0.06],
    indexFunds:  [-0.30, -0.12, -0.03, 0.18, 0.22, 0.16, 0.13, 0.10, 0.09, 0.08],
  },
};

export const SCENARIOS: Record<ScenarioId, { name: string; description: string }> = {
  steady:         { name: "Steady Market",       description: "Markets grow slowly and predictably — close to historical averages." },
  bull:           { name: "Bull Market",          description: "Markets surge. Stocks perform exceptionally well for an extended period." },
  bear:           { name: "Bear Market",          description: "Markets decline for several years before recovering." },
  volatile:       { name: "Volatile Market",      description: "Big swings up and down — emotional ride but potential for gains." },
  crash_recovery: { name: "Crash & Recovery",     description: "A major crash followed by a slow but strong recovery — tests your patience." },
};

export function runSimulation(
  allocation: AssetAllocation,
  monthlyContribution: number,
  initialValue: number,
  scenarioId: ScenarioId,
  years: number = 10
): SimulationResult {
  const returns = SCENARIO_RETURNS[scenarioId];
  const simulationYears = Math.min(years, 10);
  const annualContribution = monthlyContribution * 12;

  const allocFractions = {
    stocks:      allocation.stocks / 100,
    bonds:       allocation.bonds / 100,
    mutualFunds: allocation.mutualFunds / 100,
    indexFunds:  allocation.indexFunds / 100,
  };

  let portfolioValue = initialValue;
  const yearlyData: SimulationYear[] = [];

  for (let y = 0; y < simulationYears; y++) {
    const startValue = portfolioValue;

    // Weighted portfolio return for this year
    const portfolioReturn =
      (returns.stocks[y] ?? returns.stocks[returns.stocks.length - 1]) * allocFractions.stocks +
      (returns.bonds[y] ?? returns.bonds[returns.bonds.length - 1]) * allocFractions.bonds +
      (returns.mutualFunds[y] ?? returns.mutualFunds[returns.mutualFunds.length - 1]) * allocFractions.mutualFunds +
      (returns.indexFunds[y] ?? returns.indexFunds[returns.indexFunds.length - 1]) * allocFractions.indexFunds;

    // Contributions happen mid-year on average
    portfolioValue = portfolioValue * (1 + portfolioReturn) + annualContribution;
    const growth = portfolioValue - startValue - annualContribution;

    yearlyData.push({
      year: y + 1,
      value: Math.round(portfolioValue),
      contribution: annualContribution,
      growth: Math.round(growth),
    });
  }

  const totalContributed = annualContribution * simulationYears + initialValue;
  const totalGrowth = portfolioValue - totalContributed;

  return {
    scenarioId,
    years: yearlyData,
    finalValue: Math.round(portfolioValue),
    totalContributed: Math.round(totalContributed),
    totalGrowth: Math.round(totalGrowth),
  };
}
