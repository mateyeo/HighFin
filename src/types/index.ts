export type Role = "student" | "teacher" | "parent";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  classCode?: string;
  emailVerified: boolean;
  createdAt: string;
  level: 1 | 2;
}

export type BadgeId = "SIMULATION_COMPLETE" | "FIRST_TRADE" | "DIVERSIFIED" | "MARKET_WATCHER";

export interface EarnedBadge {
  badgeId: BadgeId;
  earnedAt: string;
  redeemed: boolean;
}

export interface MockStock {
  symbol: string;
  name: string;
  sector: string;
  basePrice: number;
  price: number;
  prevPrice: number;
  change: number;
  changePct: number;
}

export interface TradingPosition {
  symbol: string;
  name: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  value: number;
  gainLoss: number;
  gainLossPct: number;
}

export interface TradingAccount {
  cashBalance: number;
  positions: TradingPosition[];
  totalValue: number;
  totalGainLoss: number;
}

export interface TradeOrder {
  id?: string;
  symbol: string;
  name: string;
  type: "buy" | "sell";
  shares: number;
  price: number;
  total: number;
  executedAt: string;
}

export interface WatchlistItem {
  symbol: string;
  name: string;
  sector: string;
  addedAt: string;
}

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id?: string;
  userId?: string;
  role: ChatRole;
  content: string;
  sources?: { topic: string; source: string; url: string }[];
  createdAt: string;
}

export type RiskProfile = "conservative" | "balanced" | "growth" | "aggressive";

export interface QuizAnswer {
  questionId: string;
  value: number; // 1–5 scale
}

export interface QuizResult {
  userId: string;
  answers: QuizAnswer[];
  score: number;
  riskProfile: RiskProfile;
  createdAt: string;
}

export type GoalType =
  | "retirement"
  | "college"
  | "house"
  | "emergency"
  | "other";

export interface GoalPlan {
  userId: string;
  goalType: GoalType;
  targetAmount: number;
  timeHorizon: number; // years
  monthlyContribution: number;
  createdAt: string;
}

export interface AssetAllocation {
  stocks: number;   // percent 0–100
  bonds: number;
  mutualFunds: number;
  indexFunds: number;
}

export interface Portfolio {
  userId: string;
  allocation: AssetAllocation;
  simulationValue: number;
  scenarioId: string;
  updatedAt: string;
}

export type ScenarioId =
  | "steady"
  | "bull"
  | "bear"
  | "volatile"
  | "crash_recovery";

export interface SimulationYear {
  year: number;
  value: number;
  contribution: number;
  growth: number;
}

export interface SimulationResult {
  scenarioId: ScenarioId;
  years: SimulationYear[];
  finalValue: number;
  totalContributed: number;
  totalGrowth: number;
}

export interface Assignment {
  id: string;
  teacherId: string;
  title: string;
  description: string;
  dueDate: string;
  classCode: string;
}

export interface StudentProgress {
  userId: string;
  studentName: string;
  quizDone: boolean;
  goalDone: boolean;
  portfolioDone: boolean;
  simulationDone: boolean;
}

export interface AppState {
  user: User | null;
  quizResult: QuizResult | null;
  goalPlan: GoalPlan | null;
  portfolio: Portfolio | null;
  simulationResult: SimulationResult | null;
  badges: EarnedBadge[];
}
