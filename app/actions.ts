"use server";

import { isCorrect, parseNumericAnswer } from "@/lib/answer";
import { findProblem } from "@/lib/problems";

export type CheckState =
  | { status: "idle"; value: string }
  | { status: "invalid" | "incorrect" | "correct"; value: string; message: string };

export async function checkAnswer(
  problemId: string,
  _prev: CheckState,
  formData: FormData,
): Promise<CheckState> {
  const problem = findProblem(problemId);
  if (!problem) return { status: "invalid", value: "", message: "This problem is no longer available. Refresh the page." };

  // `raw` is echoed back as `value`: React resets the form after an action, and the input re-fills from it.
  const raw = String(formData.get("answer") ?? "").trim();
  const value = parseNumericAnswer(raw);
  if (value === null) return { status: "invalid", value: raw, message: "Enter a number." };

  if (!isCorrect(value, problem.answer)) {
    return { status: "incorrect", value: raw, message: "Not quite. Try again." };
  }
  const unit = problem.unit ? (problem.unit === "%" ? "%" : ` ${problem.unit}`) : "";
  return { status: "correct", value: raw, message: `Correct! ${problem.answer}${unit}.` };
}
