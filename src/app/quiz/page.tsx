"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { QUIZ_QUESTIONS, buildQuizResult, PROFILE_DESCRIPTIONS } from "@/lib/quiz";
import type { QuizAnswer } from "@/types";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ProgressBar from "@/components/ui/ProgressBar";

export default function QuizPage() {
  const { user, setQuizResult, quizResult } = useApp();
  const router = useRouter();

  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(!!quizResult);

  const question = QUIZ_QUESTIONS[currentQ];
  const isLast = currentQ === QUIZ_QUESTIONS.length - 1;

  function handleSelect(value: number) {
    setSelected(value);
  }

  function handleNext() {
    if (selected === null) return;
    const newAnswers = [
      ...answers,
      { questionId: question.id, value: selected },
    ];
    setAnswers(newAnswers);
    setSelected(null);

    if (isLast) {
      const result = buildQuizResult(user?.id ?? "guest", newAnswers);
      setQuizResult(result);
      setShowResult(true);
    } else {
      setCurrentQ((q) => q + 1);
    }
  }

  function handleRetake() {
    setCurrentQ(0);
    setAnswers([]);
    setSelected(null);
    setShowResult(false);
  }

  if (!user) {
    router.replace("/onboarding");
    return null;
  }

  const activeResult = quizResult;

  if (showResult && activeResult) {
    const profile = PROFILE_DESCRIPTIONS[activeResult.riskProfile];
    const colorMap: Record<string, string> = {
      blue:   "bg-blue-100 text-blue-800",
      green:  "bg-emerald-100 text-emerald-800",
      orange: "bg-orange-100 text-orange-800",
      red:    "bg-red-100 text-red-800",
    };
    const badge = colorMap[profile.color] ?? "bg-slate-100 text-slate-800";

    return (
      <div className="max-w-lg mx-auto px-4 py-10">
        <Card>
          <div className="text-center mb-6">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${badge} mb-3`}>
              {activeResult.riskProfile.toUpperCase()}
            </span>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">{profile.title}</h1>
            <p className="text-slate-600">{profile.description}</p>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-500">Risk Score</span>
              <span className="font-bold text-slate-800">{activeResult.score}/100</span>
            </div>
            <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${activeResult.score}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>Conservative</span>
              <span>Aggressive</span>
            </div>
          </div>

          <p className="text-sm text-slate-500 mb-6">
            This profile is based on your answers about risk tolerance, time horizon,
            income stability, and experience. It will guide your portfolio recommendations.
          </p>

          <div className="flex flex-col gap-3">
            <Button fullWidth onClick={() => router.push("/goal")}>
              Next: Set a Goal →
            </Button>
            <Button fullWidth variant="ghost" onClick={handleRetake}>
              Retake Quiz
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Risk Tolerance Quiz</h1>
        <ProgressBar current={currentQ + 1} total={QUIZ_QUESTIONS.length} label="Question progress" />
      </div>

      <Card>
        <p className="text-lg font-semibold text-slate-900 mb-6 leading-snug">
          {question.text}
        </p>

        <div className="flex flex-col gap-3 mb-6">
          {question.options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSelect(opt.value)}
              className={[
                "text-left p-4 rounded-xl border-2 transition-all text-sm leading-snug",
                selected === opt.value
                  ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                  : "border-slate-200 bg-white hover:border-slate-300 text-slate-700",
              ].join(" ")}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <Button
          fullWidth
          onClick={handleNext}
          disabled={selected === null}
          size="lg"
        >
          {isLast ? "See My Profile →" : "Next Question →"}
        </Button>
      </Card>
    </div>
  );
}
