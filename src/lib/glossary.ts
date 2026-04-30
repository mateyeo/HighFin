export interface GlossaryTerm {
  term: string;
  short: string;
  full: string;
}

export const GLOSSARY: GlossaryTerm[] = [
  {
    term: "401(k)",
    short: "Employer-linked retirement account",
    full: "A 401(k) is a retirement savings account offered by employers. You put in pre-tax money from your paycheck, and it grows tax-free until retirement. Many employers match a portion of what you contribute — that's free money.",
  },
  {
    term: "IRA",
    short: "Individual Retirement Account",
    full: "An IRA (Individual Retirement Account) is a retirement savings account you open on your own — not through an employer. There are two types: Traditional IRA (tax break now, pay taxes later) and Roth IRA (pay taxes now, withdrawals in retirement are tax-free).",
  },
  {
    term: "Stock",
    short: "Ownership share in a company",
    full: "When you buy a stock, you buy a tiny piece of a company. If the company grows, your share is worth more. If the company struggles, your share loses value. Stocks can deliver high returns but also carry the most risk.",
  },
  {
    term: "Bond",
    short: "Loan you make to a company or government",
    full: "A bond is like a loan you give to a company or government. They promise to pay you back with interest by a specific date. Bonds are generally safer than stocks but grow more slowly.",
  },
  {
    term: "Mutual Fund",
    short: "Pooled bundle of investments managed by a professional",
    full: "A mutual fund pools money from many investors to buy a mix of stocks, bonds, or other assets. A professional fund manager decides what to buy and sell. This gives you automatic diversification without picking individual stocks.",
  },
  {
    term: "Index Fund",
    short: "Fund that tracks a market index like the S&P 500",
    full: "An index fund automatically buys all the stocks in a market index (like the S&P 500, which includes the 500 largest US companies). It requires no active management, so fees are low. Historically, index funds outperform most actively managed funds over time.",
  },
  {
    term: "Compound Growth",
    short: "Earning returns on your returns",
    full: "Compound growth means your investment earnings also earn returns. For example, if you earn $100 on $1,000 in year one, in year two you earn returns on $1,100. Over decades, compounding creates dramatic wealth growth — Albert Einstein supposedly called it the 'eighth wonder of the world.'",
  },
  {
    term: "Diversification",
    short: "Spreading investments to reduce risk",
    full: "Diversification means spreading your money across different types of investments (stocks, bonds, funds) and industries. If one investment loses value, others may hold steady or grow — reducing your overall risk.",
  },
  {
    term: "Volatility",
    short: "How much an investment's value swings up and down",
    full: "Volatility measures how much an investment's value changes over time. High volatility means big price swings — exciting when prices go up, stressful when they drop. Stocks are more volatile than bonds.",
  },
  {
    term: "Risk Tolerance",
    short: "How comfortable you are with investment losses",
    full: "Risk tolerance is your ability and willingness to handle drops in your portfolio's value. It depends on your financial situation, time horizon, and personality. Knowing your risk tolerance helps you choose investments you can stick with through market downturns.",
  },
  {
    term: "Time Horizon",
    short: "How long until you need your money",
    full: "Time horizon is the length of time you plan to hold an investment before needing the money. Longer time horizons allow you to take more risk because you have time to recover from market downturns.",
  },
  {
    term: "Rebalancing",
    short: "Adjusting your portfolio back to your target mix",
    full: "Over time, some investments grow faster than others, shifting your portfolio away from your original allocation. Rebalancing means selling some of the overperformers and buying more of the underperformers to get back to your target mix.",
  },
];
