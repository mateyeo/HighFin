import type { QuizAnswer, RiskProfile, QuizResult } from "@/types";

export interface QuizQuestion {
  id: string;
  text: string;
  options: { label: string; value: number }[];
  weight: "risk" | "horizon" | "stability" | "liquidity" | "experience" | "loss";
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    text: "If your portfolio dropped 20% in a month, what would you do?",
    weight: "risk",
    options: [
      { label: "Sell everything immediately", value: 1 },
      { label: "Sell some to reduce exposure", value: 2 },
      { label: "Hold and wait it out", value: 3 },
      { label: "Stay calm — it's a long game", value: 4 },
      { label: "Buy more while prices are low", value: 5 },
    ],
  },
  {
    id: "q2",
    text: "How many years until you need this money?",
    weight: "horizon",
    options: [
      { label: "Less than 1 year", value: 1 },
      { label: "1–3 years", value: 2 },
      { label: "3–5 years", value: 3 },
      { label: "5–10 years", value: 4 },
      { label: "More than 10 years", value: 5 },
    ],
  },
  {
    id: "q3",
    text: "How stable is your monthly income or allowance?",
    weight: "stability",
    options: [
      { label: "Very unpredictable", value: 1 },
      { label: "Somewhat unpredictable", value: 2 },
      { label: "Mostly stable", value: 3 },
      { label: "Very stable", value: 4 },
      { label: "Extremely stable and growing", value: 5 },
    ],
  },
  {
    id: "q4",
    text: "If you needed cash unexpectedly, how quickly would you need to access your investments?",
    weight: "liquidity",
    options: [
      { label: "Immediately — within days", value: 1 },
      { label: "Within a few weeks", value: 2 },
      { label: "Within a few months", value: 3 },
      { label: "Not for at least a year", value: 4 },
      { label: "I have an emergency fund; I wouldn't need to touch investments", value: 5 },
    ],
  },
  {
    id: "q5",
    text: "How familiar are you with investing?",
    weight: "experience",
    options: [
      { label: "I've never heard of stocks or bonds", value: 1 },
      { label: "I know a little", value: 2 },
      { label: "I understand the basics", value: 3 },
      { label: "I follow markets and understand most terms", value: 4 },
      { label: "I've invested before and study finance regularly", value: 5 },
    ],
  },
  {
    id: "q6",
    text: "What's your main goal for investing?",
    weight: "risk",
    options: [
      { label: "Protect my money — safety first", value: 1 },
      { label: "Grow slowly with low risk", value: 2 },
      { label: "Balance growth and safety", value: 3 },
      { label: "Grow as much as possible, accepting some loss", value: 4 },
      { label: "Maximum growth — I'm okay with large swings", value: 5 },
    ],
  },
  {
    id: "q7",
    text: "Which best describes how you'd feel about losing $500 from a $1,000 investment?",
    weight: "loss",
    options: [
      { label: "Devastated — I can't afford to lose", value: 1 },
      { label: "Very upset", value: 2 },
      { label: "Disappointed but okay", value: 3 },
      { label: "It's part of investing — I accept it", value: 4 },
      { label: "Fine — higher risk, higher reward", value: 5 },
    ],
  },
];

// Weights per dimension (higher = more influence on final score)
const DIMENSION_WEIGHT: Record<QuizQuestion["weight"], number> = {
  risk: 2,
  horizon: 2,
  stability: 1,
  liquidity: 1.5,
  experience: 1,
  loss: 1.5,
};

export function scoreQuiz(answers: QuizAnswer[]): { score: number; riskProfile: RiskProfile } {
  const questionMap = Object.fromEntries(QUIZ_QUESTIONS.map((q) => [q.id, q]));

  let weightedSum = 0;
  let totalWeight = 0;

  for (const answer of answers) {
    const q = questionMap[answer.questionId];
    if (!q) continue;
    const w = DIMENSION_WEIGHT[q.weight];
    weightedSum += answer.value * w;
    totalWeight += w * 5; // 5 is max value
  }

  const score = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) : 0;

  // Override toward conservative if liquidity or horizon are low
  const liquidityAnswer = answers.find((a) => a.questionId === "q4");
  const horizonAnswer = answers.find((a) => a.questionId === "q2");

  const liquidityLow = liquidityAnswer && liquidityAnswer.value <= 2;
  const horizonShort = horizonAnswer && horizonAnswer.value <= 2;

  let riskProfile: RiskProfile;

  if (liquidityLow || horizonShort) {
    riskProfile = score >= 60 ? "balanced" : "conservative";
  } else if (score < 35) {
    riskProfile = "conservative";
  } else if (score < 55) {
    riskProfile = "balanced";
  } else if (score < 75) {
    riskProfile = "growth";
  } else {
    riskProfile = "aggressive";
  }

  return { score, riskProfile };
}

export function buildQuizResult(userId: string, answers: QuizAnswer[]): QuizResult {
  const { score, riskProfile } = scoreQuiz(answers);
  return {
    userId,
    answers,
    score,
    riskProfile,
    createdAt: new Date().toISOString(),
  };
}

export const PROFILE_DESCRIPTIONS: Record<RiskProfile, { title: string; description: string; color: string }> = {
  conservative: {
    title: "Conservative Investor",
    description:
      "You prefer keeping your money safe. You're okay with slower growth if it means less chance of losing money. A conservative portfolio focuses on bonds and stable funds with a small amount in stocks.",
    color: "blue",
  },
  balanced: {
    title: "Balanced Investor",
    description:
      "You want a mix of safety and growth. You can handle some ups and downs in your portfolio. A balanced portfolio splits investment across stocks, bonds, and funds in roughly equal measure.",
    color: "green",
  },
  growth: {
    title: "Growth Investor",
    description:
      "You're focused on building wealth over time and can handle moderate dips. A growth portfolio leans toward stocks and index funds, with fewer bonds.",
    color: "orange",
  },
  aggressive: {
    title: "Aggressive Investor",
    description:
      "You're comfortable with big swings in exchange for the highest potential returns. An aggressive portfolio is mostly stocks and growth-oriented funds.",
    color: "red",
  },
};

export const RECOMMENDED_ALLOCATIONS: Record<RiskProfile, { stocks: number; bonds: number; mutualFunds: number; indexFunds: number }> = {
  conservative: { stocks: 20, bonds: 50, mutualFunds: 20, indexFunds: 10 },
  balanced:     { stocks: 30, bonds: 30, mutualFunds: 20, indexFunds: 20 },
  growth:       { stocks: 40, bonds: 15, mutualFunds: 15, indexFunds: 30 },
  aggressive:   { stocks: 55, bonds: 5,  mutualFunds: 10, indexFunds: 30 },
};
