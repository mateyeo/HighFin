import type { AppState } from "@/types";

const KEY = "highfin_state";

export function loadState(): AppState {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AppState) : emptyState();
  } catch {
    return emptyState();
  }
}

export function saveState(state: AppState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function clearState(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}

function emptyState(): AppState {
  return {
    user: null,
    quizResult: null,
    goalPlan: null,
    portfolio: null,
    simulationResult: null,
  };
}
