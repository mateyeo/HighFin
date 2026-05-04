"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type {
  AppState,
  User,
  QuizResult,
  GoalPlan,
  Portfolio,
  SimulationResult,
  EarnedBadge,
} from "@/types";
import { loadState, saveState, clearState } from "@/frontend/lib/storage";
import { apiGet, apiPost } from "@/frontend/lib/apiClient";
import { fetchApi } from "@/frontend/lib/config";

interface AppContextValue extends AppState {
  hydrated: boolean;
  authLoading: boolean;
  setQuizResult:       (result: QuizResult | null)       => void;
  setGoalPlan:         (plan: GoalPlan | null)           => void;
  setPortfolio:        (portfolio: Portfolio | null)     => void;
  setSimulationResult: (result: SimulationResult | null) => void;
  setBadges:           (badges: EarnedBadge[])           => void;
  setUser:             (user: User | null)               => void;
  register: (name: string, email: string, password: string, role: string, classCode?: string) => Promise<void>;
  login:    (email: string, password: string) => Promise<void>;
  logout:   () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    user:             null,
    quizResult:       null,
    goalPlan:         null,
    portfolio:        null,
    simulationResult: null,
    badges:           [],
  });
  const [hydrated,    setHydrated]    = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // Load localStorage draft immediately so pages render without flicker
    const local = loadState();
    if (local.user || local.quizResult || local.goalPlan) {
      setState(local);
    }

    // Check if there is a valid session (httpOnly cookie sent automatically)
    apiGet<User>("/api/auth/me").then((user) => {
      if (user) {
        syncFromServer(user).finally(() => {
          setHydrated(true);
          setAuthLoading(false);
        });
      } else {
        // Guest — keep localStorage draft, but clear any stale user object
        setState((prev) => ({ ...prev, user: null }));
        setHydrated(true);
        setAuthLoading(false);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function syncFromServer(user: User) {
    const [quiz, goal, portfolio, sim, badges] = await Promise.all([
      apiGet<QuizResult>("/api/quiz"),
      apiGet<GoalPlan>("/api/goal"),
      apiGet<Portfolio>("/api/portfolio"),
      apiGet<SimulationResult>("/api/simulation"),
      apiGet<EarnedBadge[]>("/api/badges"),
    ]);
    setState((prev) => {
      const next: AppState = {
        user,
        quizResult:       quiz       ?? prev.quizResult,
        goalPlan:         goal       ?? prev.goalPlan,
        portfolio:        portfolio  ?? prev.portfolio,
        simulationResult: sim        ?? prev.simulationResult,
        badges:           badges     ?? prev.badges,
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

  async function register(
    name: string,
    email: string,
    password: string,
    role: string,
    classCode?: string
  ) {
    const res = await fetchApi("/api/auth/register", {
      method: "POST",
      body:   JSON.stringify({ name, email, password, role, classCode }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Registration failed.");
    // Server sets the session cookie and returns the user — sync immediately.
    await syncFromServer(data.user as User);
  }

  async function login(email: string, password: string) {
    const res = await fetchApi("/api/auth/login", {
      method: "POST",
      body:   JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      const err = new Error(data.error ?? "Login failed.") as Error & { code?: string; email?: string };
      err.code  = data.code;
      err.email = data.email;
      throw err;
    }
    await syncFromServer(data.user as User);
  }

  async function logout() {
    await fetchApi("/api/auth/logout", { method: "POST" });
    clearState();
    setState({
      user:             null,
      quizResult:       null,
      goalPlan:         null,
      portfolio:        null,
      simulationResult: null,
      badges:           [],
    });
  }

  return (
    <AppContext.Provider
      value={{
        ...state,
        hydrated,
        authLoading,

        setQuizResult: (quizResult) => {
          update({ quizResult });
          if (quizResult && state.user) apiPost("/api/quiz", quizResult);
        },

        setGoalPlan: (goalPlan) => {
          update({ goalPlan });
          if (goalPlan && state.user) apiPost("/api/goal", goalPlan);
        },

        setPortfolio: (portfolio) => {
          update({ portfolio });
          if (portfolio && state.user) apiPost("/api/portfolio", portfolio);
        },

        setSimulationResult: (simulationResult) => {
          update({ simulationResult });
          if (simulationResult && state.user) apiPost("/api/simulation", simulationResult);
        },

        setBadges: (badges) => {
          update({ badges });
        },

        setUser: (user) => {
          update({ user });
        },

        register,
        login,
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
