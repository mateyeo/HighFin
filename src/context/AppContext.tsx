"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type {
  AppState,
  User,
  QuizResult,
  GoalPlan,
  Portfolio,
  SimulationResult,
} from "@/types";
import { loadState, saveState, clearState } from "@/lib/storage";
import { getToken, setToken, clearToken, apiGet, apiPost } from "@/lib/apiClient";

interface AppContextValue extends AppState {
  hydrated: boolean;
  setUser: (user: User | null) => void;
  setQuizResult: (result: QuizResult | null) => void;
  setGoalPlan: (plan: GoalPlan | null) => void;
  setPortfolio: (portfolio: Portfolio | null) => void;
  setSimulationResult: (result: SimulationResult | null) => void;
  signin: (name: string, email: string, role: string, classCode?: string) => Promise<void>;
  logout: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => ({
    user: null,
    quizResult: null,
    goalPlan: null,
    portfolio: null,
    simulationResult: null,
  }));
  const [hydrated, setHydrated] = useState(false);

  // On mount: load from localStorage immediately, then sync from API
  useEffect(() => {
    const local = loadState();
    setState(local);

    if (local.user && getToken()) {
      // Hydrate server data in background
      syncFromServer(local.user.id).finally(() => setHydrated(true));
    } else {
      setHydrated(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function syncFromServer(userId: string) {
    const [quiz, goal, portfolio, sim] = await Promise.all([
      apiGet<QuizResult>("/api/quiz"),
      apiGet<GoalPlan>("/api/goal"),
      apiGet<Portfolio>("/api/portfolio"),
      apiGet<SimulationResult>("/api/simulation"),
    ]);

    setState((prev) => {
      const next: AppState = {
        ...prev,
        quizResult:       quiz       ?? prev.quizResult,
        goalPlan:         goal       ?? prev.goalPlan,
        portfolio:        portfolio  ?? prev.portfolio,
        simulationResult: sim        ?? prev.simulationResult,
      };
      saveState(next);
      return next;
    });
  }

  function update(partial: Partial<AppState>) {
    setState((prev) => {
      const next = { ...prev, ...partial };
      saveState(next);
      return next;
    });
  }

  async function signin(name: string, email: string, role: string, classCode?: string) {
    const res = await apiPost<{ token: string; user: User }>("/api/auth/signin", {
      name,
      email,
      role,
      classCode,
    });
    if (!res) throw new Error("Sign-in failed. Check your connection and try again.");

    setToken(res.token);
    update({ user: res.user });

    // Pull any existing server data for this account
    await syncFromServer(res.user.id);
  }

  function logout() {
    clearToken();
    clearState();
    setState({
      user: null,
      quizResult: null,
      goalPlan: null,
      portfolio: null,
      simulationResult: null,
    });
  }

  return (
    <AppContext.Provider
      value={{
        ...state,
        hydrated,
        setUser: (user) => update({ user }),

        setQuizResult: (quizResult) => {
          update({ quizResult });
          if (quizResult) apiPost("/api/quiz", quizResult);
        },

        setGoalPlan: (goalPlan) => {
          update({ goalPlan });
          if (goalPlan) apiPost("/api/goal", goalPlan);
        },

        setPortfolio: (portfolio) => {
          update({ portfolio });
          if (portfolio) apiPost("/api/portfolio", portfolio);
        },

        setSimulationResult: (simulationResult) => {
          update({ simulationResult });
          if (simulationResult) apiPost("/api/simulation", simulationResult);
        },

        signin,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
