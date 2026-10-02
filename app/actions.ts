"use server";

import { isCorrect, parseNumericAnswer } from "@/lib/answer";
import { getSolvedToday, recordAttempt } from "@/lib/leaderboard";
import { findProblem, formatAnswer, getDailyMode, solvedMessage } from "@/lib/problems";
import { getCurrentUser } from "@/lib/supabase/user";

export type CheckState =
  | { status: "idle"; value: string }
  | { status: "invalid" | "incorrect" | "correct"; value: string; message: string };

export async function checkAnswer(
  problemId: string,
  _prev: CheckState,
  formData: FormData,
): Promise<CheckState> {
  // Server Actions are callable directly, so check auth here too, not only on the page.
  if (!(await getCurrentUser())) return { status: "invalid", value: "", message: "Sign in to check your answer." };

  const problem = findProblem(problemId);
  if (!problem) return { status: "invalid", value: "", message: "This problem is no longer available. Refresh the page." };

  // `raw` is echoed back as `value`: React resets the form after an action, and the input re-fills from it.
  const raw = String(formData.get("answer") ?? "").trim();
  const value = parseNumericAnswer(raw);
  if (value === null) return { status: "invalid", value: raw, message: "Enter a number." };

  // Only today's problems count toward the leaderboard. A page left open past 00:00 UTC still checks answers.
  const mode = getDailyMode(problem.id);
  // Once today's problem is solved it stays solved, e.g. when a stale tab submits again.
  if (mode && (await getSolvedToday()).has(problem.id)) {
    return { status: "correct", value: String(problem.answer), message: solvedMessage(problem) };
  }

  const correct = isCorrect(value, problem.answer);
  if (mode) await recordAttempt(mode, problem.id, correct);

  if (!correct) {
    return { status: "incorrect", value: raw, message: "Not quite. Try again." };
  }
  return { status: "correct", value: raw, message: `Correct! ${formatAnswer(problem)}.` };
}
