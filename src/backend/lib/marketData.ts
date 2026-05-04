export interface StockDef {
  symbol: string;
  name: string;
  sector: string;
  basePrice: number;
}

export const STOCK_LIST: StockDef[] = [
  { symbol: "APEX",  name: "Apex Technologies",    sector: "Technology",  basePrice: 142.50 },
  { symbol: "NOVA",  name: "Nova Energy Corp",      sector: "Energy",      basePrice: 67.20  },
  { symbol: "CREST", name: "Crestview Bank",        sector: "Finance",     basePrice: 89.40  },
  { symbol: "PEAK",  name: "Peak Pharma",           sector: "Healthcare",  basePrice: 211.80 },
  { symbol: "RIDGE", name: "Ridge Consumer Brands", sector: "Consumer",    basePrice: 54.30  },
  { symbol: "SWELL", name: "Swell REIT",            sector: "Real Estate", basePrice: 38.90  },
  { symbol: "TITAN", name: "Titan Industrial",      sector: "Industrials", basePrice: 156.70 },
  { symbol: "VISTA", name: "Vista Telecom",         sector: "Telecom",     basePrice: 47.60  },
  { symbol: "BLAZE", name: "Blaze Retail Group",    sector: "Retail",      basePrice: 93.10  },
  { symbol: "FORGE", name: "Forge Materials",       sector: "Materials",   basePrice: 72.40  },
  { symbol: "EMBER", name: "Ember Biotech",         sector: "Biotech",     basePrice: 286.30 },
  { symbol: "FLINT", name: "Flint Utility Corp",    sector: "Utilities",   basePrice: 61.20  },
  { symbol: "GROVE", name: "Grove Foods",           sector: "Consumer",    basePrice: 44.70  },
  { symbol: "CLOUD", name: "CloudStream Inc",       sector: "Technology",  basePrice: 178.90 },
  { symbol: "DRIVE", name: "Drive Analytics",       sector: "Technology",  basePrice: 65.30  },
  { symbol: "MKTX",  name: "Market Index ETF",      sector: "ETF",         basePrice: 415.20 },
  { symbol: "BNDX",  name: "Bond Market ETF",       sector: "ETF - Bonds", basePrice: 74.30  },
  { symbol: "SMCX",  name: "Small Cap ETF",         sector: "ETF",         basePrice: 187.60 },
  { symbol: "DIVX",  name: "Dividend Growth ETF",   sector: "ETF",         basePrice: 132.40 },
  { symbol: "TECH",  name: "Tech Sector ETF",       sector: "ETF - Tech",  basePrice: 392.80 },
];

// Deterministic seeded random — same symbol+date always returns same price
function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function dayPrice(basePrice: number, symbol: string, offsetDays = 0): number {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const daySeed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  const symSeed  = symbol.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const rand = seededRandom(daySeed * 31 + symSeed * 17);
  const variation = (rand - 0.5) * 0.10; // ±5% daily range
  return Math.round(basePrice * (1 + variation) * 100) / 100;
}

export function getMarketPrices(): (StockDef & { price: number; prevPrice: number; change: number; changePct: number })[] {
  return STOCK_LIST.map((s) => {
    const price     = dayPrice(s.basePrice, s.symbol, 0);
    const prevPrice = dayPrice(s.basePrice, s.symbol, -1);
    const change    = Math.round((price - prevPrice) * 100) / 100;
    const changePct = Math.round((change / prevPrice) * 10000) / 100;
    return { ...s, price, prevPrice, change, changePct };
  });
}

export function getStockPrice(symbol: string): number {
  const s = STOCK_LIST.find((s) => s.symbol === symbol);
  return s ? dayPrice(s.basePrice, symbol, 0) : 0;
}

export function getStockBySymbol(symbol: string): StockDef | undefined {
  return STOCK_LIST.find((s) => s.symbol === symbol);
}
