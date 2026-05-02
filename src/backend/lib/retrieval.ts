export interface RetrievalResult {
  topic: string;
  summary: string;
  source: string;
  url: string;
}

// Static knowledge base. Extend by adding more entries or swapping in a
// vector-search implementation behind the same retrieveContext() interface.
const KNOWLEDGE_BASE: RetrievalResult[] = [
  {
    topic: "index fund",
    summary:
      "An index fund tracks a market index (like the S&P 500) and holds the same investments in the same proportions. They typically have very low fees and offer instant diversification across hundreds of companies.",
    source: "Investopedia",
    url: "https://www.investopedia.com/terms/i/indexfund.asp",
  },
  {
    topic: "mutual fund",
    summary:
      "A mutual fund pools money from many investors to buy a diversified portfolio of stocks, bonds, or other assets managed by a professional. Fees (the expense ratio) vary widely.",
    source: "SEC Investor.gov",
    url: "https://www.investor.gov/introduction-investing/investing-basics/investment-products/mutual-funds-and-exchange-traded-funds-etfs",
  },
  {
    topic: "bonds",
    summary:
      "A bond is a loan you give to a company or government. They pay regular interest and return your principal at maturity. Generally lower risk than stocks, but also lower long-term returns.",
    source: "FINRA",
    url: "https://www.finra.org/investors/learn-to-invest/types-investments/bonds",
  },
  {
    topic: "stocks",
    summary:
      "A stock represents a small ownership share in a company. Prices rise and fall with company performance and market sentiment. Stocks offer higher long-term growth potential than bonds but with more short-term volatility.",
    source: "Investopedia",
    url: "https://www.investopedia.com/terms/s/stock.asp",
  },
  {
    topic: "diversification",
    summary:
      "Spreading investments across different asset types and sectors reduces risk. If one investment falls, others may hold steady or rise, smoothing out your overall returns over time.",
    source: "Investopedia",
    url: "https://www.investopedia.com/terms/d/diversification.asp",
  },
  {
    topic: "401k",
    summary:
      "A 401(k) is a workplace retirement account. Contributions come from pre-tax pay, lowering your taxable income today. Many employers match a portion of contributions — that's free money. Withdrawals in retirement are taxed as ordinary income.",
    source: "IRS",
    url: "https://www.irs.gov/retirement-plans/401k-plans",
  },
  {
    topic: "ira",
    summary:
      "An IRA (Individual Retirement Account) is a personal retirement savings account. Traditional IRAs may give you a tax deduction now; Roth IRAs let your money grow tax-free with tax-free withdrawals in retirement.",
    source: "IRS",
    url: "https://www.irs.gov/retirement-plans/individual-retirement-arrangements-iras",
  },
  {
    topic: "risk",
    summary:
      "Investment risk is the chance an investment loses value. Higher potential returns usually come with higher risk. Your risk tolerance depends on your time horizon, financial goals, and comfort with seeing your balance drop temporarily.",
    source: "FINRA",
    url: "https://www.finra.org/investors/learn-to-invest/key-investing-concepts/risk",
  },
  {
    topic: "compound interest",
    summary:
      "Compound interest earns returns on both your original investment AND previously earned returns. Over decades, this creates exponential growth. Starting early — even with small amounts — makes a dramatic difference.",
    source: "Investopedia",
    url: "https://www.investopedia.com/terms/c/compoundinterest.asp",
  },
  {
    topic: "emergency fund",
    summary:
      "An emergency fund is 3–6 months of living expenses kept in a liquid, low-risk account (like a high-yield savings account). It prevents you from selling investments at a loss during unexpected events like job loss or medical bills.",
    source: "CFPB",
    url: "https://www.consumerfinance.gov/an-essential-guide-to-building-an-emergency-fund/",
  },
  {
    topic: "budget",
    summary:
      "A budget is a monthly plan for spending and saving. The popular 50/30/20 rule allocates 50% to needs, 30% to wants, and 20% to savings or debt repayment. Tracking spending is the first step to building wealth.",
    source: "Investopedia",
    url: "https://www.investopedia.com/financial-edge/1109/6-reasons-why-you-need-a-budget.aspx",
  },
  {
    topic: "inflation",
    summary:
      "Inflation is the gradual rise in prices that reduces purchasing power over time. Investing helps your money grow faster than inflation — cash sitting in a low-interest account slowly loses real value.",
    source: "Federal Reserve",
    url: "https://www.federalreserve.gov/faqs/economy_14400.htm",
  },
  {
    topic: "asset allocation",
    summary:
      "Asset allocation is how you divide investments among categories like stocks, bonds, and cash. Your ideal mix depends on your goals, time horizon, and risk tolerance. Younger investors often hold more stocks; those nearing retirement often shift to more bonds.",
    source: "SEC",
    url: "https://www.investor.gov/additional-resources/general-resources/publications-research/info-sheets/beginners-guide-asset",
  },
  {
    topic: "etf",
    summary:
      "An ETF (Exchange-Traded Fund) is like a mutual fund but trades on a stock exchange throughout the day. Most ETFs passively track an index and have low expense ratios, making them a popular choice for beginner investors.",
    source: "Investopedia",
    url: "https://www.investopedia.com/terms/e/etf.asp",
  },
  {
    topic: "dollar cost averaging",
    summary:
      "Dollar-cost averaging means investing a fixed dollar amount on a regular schedule regardless of price. You automatically buy more shares when prices are low and fewer when prices are high, reducing the impact of market volatility.",
    source: "Investopedia",
    url: "https://www.investopedia.com/terms/d/dollarcostaveraging.asp",
  },
];

/**
 * Find knowledge base entries relevant to a user query.
 * This is a simple keyword matcher — replace the body with a vector search
 * call (e.g. OpenAI embeddings + Pinecone) without changing the signature.
 */
export function retrieveContext(query: string): RetrievalResult[] {
  const lower = query.toLowerCase();
  return KNOWLEDGE_BASE.filter((item) => {
    const words = item.topic.split(/\s+/);
    return (
      lower.includes(item.topic) ||
      words.some((w) => w.length > 3 && lower.includes(w))
    );
  }).slice(0, 3);
}
