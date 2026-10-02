/**
 * Pulls the first number out of a free-text answer.
 * Accepts "20", "20 minutes", "1,500", "4.5h", "75%", "-3".
 */
export function parseNumericAnswer(input: string): number | null {
  const match = input.replace(/,/g, "").match(/-?\d*\.?\d+/);
  if (!match) return null;
  const value = Number(match[0]);
  return Number.isFinite(value) ? value : null;
}

export function isCorrect(value: number, expected: number) {
  return Math.abs(value - expected) < 1e-6;
}
