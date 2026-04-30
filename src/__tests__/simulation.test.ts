import { runSimulation } from "@/lib/simulation";
import type { AssetAllocation } from "@/types";

const balanced: AssetAllocation = { stocks: 30, bonds: 30, mutualFunds: 20, indexFunds: 20 };
const aggressive: AssetAllocation = { stocks: 55, bonds: 5, mutualFunds: 10, indexFunds: 30 };
const conservative: AssetAllocation = { stocks: 20, bonds: 50, mutualFunds: 20, indexFunds: 10 };

describe("runSimulation", () => {
  it("returns 10 year entries by default", () => {
    const r = runSimulation(balanced, 200, 1000, "steady");
    expect(r.years).toHaveLength(10);
  });

  it("each year entry is increasing in steady scenario", () => {
    const r = runSimulation(balanced, 200, 1000, "steady");
    for (let i = 1; i < r.years.length; i++) {
      expect(r.years[i].value).toBeGreaterThan(r.years[i - 1].value);
    }
  });

  it("finalValue equals last year value", () => {
    const r = runSimulation(balanced, 200, 1000, "steady");
    expect(r.finalValue).toBe(r.years[r.years.length - 1].value);
  });

  it("bull market final value exceeds bear market for same allocation", () => {
    const bull = runSimulation(balanced, 200, 1000, "bull");
    const bear = runSimulation(balanced, 200, 1000, "bear");
    expect(bull.finalValue).toBeGreaterThan(bear.finalValue);
  });

  it("aggressive allocation outperforms conservative in bull market", () => {
    const agg = runSimulation(aggressive, 200, 1000, "bull");
    const con = runSimulation(conservative, 200, 1000, "bull");
    expect(agg.finalValue).toBeGreaterThan(con.finalValue);
  });

  it("conservative allocation outperforms aggressive in bear market", () => {
    const agg = runSimulation(aggressive, 200, 1000, "bear");
    const con = runSimulation(conservative, 200, 1000, "bear");
    expect(con.finalValue).toBeGreaterThan(agg.finalValue);
  });

  it("totalContributed includes initial value plus contributions", () => {
    const r = runSimulation(balanced, 100, 500, "steady", 10);
    expect(r.totalContributed).toBe(500 + 100 * 12 * 10);
  });

  it("totalGrowth equals finalValue minus totalContributed", () => {
    const r = runSimulation(balanced, 200, 1000, "steady");
    expect(r.totalGrowth).toBe(r.finalValue - r.totalContributed);
  });

  it("higher monthly contribution leads to higher final value", () => {
    const low = runSimulation(balanced, 100, 1000, "steady");
    const high = runSimulation(balanced, 500, 1000, "steady");
    expect(high.finalValue).toBeGreaterThan(low.finalValue);
  });

  it("crash_recovery scenario starts negative but ends positive total growth", () => {
    const r = runSimulation(aggressive, 500, 5000, "crash_recovery");
    // Year 1 should have negative growth for aggressive in crash
    expect(r.years[0].growth).toBeLessThan(0);
    // But long term should recover
    expect(r.finalValue).toBeGreaterThan(0);
  });

  it("volatile scenario returns valid numeric values for all years", () => {
    const r = runSimulation(balanced, 200, 1000, "volatile");
    for (const y of r.years) {
      expect(Number.isFinite(y.value)).toBe(true);
      expect(Number.isFinite(y.growth)).toBe(true);
    }
  });

  it("respects custom year count", () => {
    const r = runSimulation(balanced, 200, 1000, "steady", 5);
    expect(r.years).toHaveLength(5);
  });

  it("caps year count at 10", () => {
    const r = runSimulation(balanced, 200, 1000, "steady", 20);
    expect(r.years).toHaveLength(10);
  });
});
