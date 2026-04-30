import { scoreQuiz, buildQuizResult, QUIZ_QUESTIONS } from "@/lib/quiz";
import type { QuizAnswer } from "@/types";

function allAnswers(value: number): QuizAnswer[] {
  return QUIZ_QUESTIONS.map((q) => ({ questionId: q.id, value }));
}

describe("scoreQuiz", () => {
  it("returns conservative when all answers are 1", () => {
    const { riskProfile, score } = scoreQuiz(allAnswers(1));
    expect(riskProfile).toBe("conservative");
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThan(35);
  });

  it("returns aggressive when all answers are 5", () => {
    const { riskProfile, score } = scoreQuiz(allAnswers(5));
    expect(riskProfile).toBe("aggressive");
    expect(score).toBeGreaterThan(74);
  });

  it("returns balanced for mid-range answers", () => {
    const { riskProfile } = scoreQuiz(allAnswers(3));
    expect(["balanced", "growth"]).toContain(riskProfile);
  });

  it("biases to conservative when liquidity is low (q4=1) even with moderate risk", () => {
    const answers = allAnswers(3);
    const idx = answers.findIndex((a) => a.questionId === "q4");
    answers[idx] = { questionId: "q4", value: 1 };
    const { riskProfile } = scoreQuiz(answers);
    expect(["conservative", "balanced"]).toContain(riskProfile);
  });

  it("biases to conservative when horizon is short (q2=1)", () => {
    const answers = allAnswers(4);
    const idx = answers.findIndex((a) => a.questionId === "q2");
    answers[idx] = { questionId: "q2", value: 1 };
    const { riskProfile } = scoreQuiz(answers);
    expect(["conservative", "balanced"]).toContain(riskProfile);
  });

  it("score is between 0 and 100", () => {
    for (const v of [1, 2, 3, 4, 5]) {
      const { score } = scoreQuiz(allAnswers(v));
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    }
  });

  it("handles partial answers gracefully", () => {
    const partial: QuizAnswer[] = [
      { questionId: "q1", value: 2 },
      { questionId: "q3", value: 4 },
    ];
    const { score, riskProfile } = scoreQuiz(partial);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
    expect(["conservative", "balanced", "growth", "aggressive"]).toContain(riskProfile);
  });

  it("handles empty answers without crashing", () => {
    const { score, riskProfile } = scoreQuiz([]);
    expect(score).toBe(0);
    expect(["conservative", "balanced", "growth", "aggressive"]).toContain(riskProfile);
  });
});

describe("buildQuizResult", () => {
  it("builds a full quiz result with all required fields", () => {
    const answers = allAnswers(3);
    const result = buildQuizResult("user-1", answers);
    expect(result.userId).toBe("user-1");
    expect(result.answers).toEqual(answers);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(["conservative", "balanced", "growth", "aggressive"]).toContain(result.riskProfile);
    expect(new Date(result.createdAt).getTime()).not.toBeNaN();
  });
});
