import "server-only";
import type { Mode } from "./problems";
import { createClient } from "./supabase/server";

/** "month" counts only the current UTC calendar month. */
export type LeaderboardPeriod = "all" | "month";

export type LeaderboardRow = {
  rank: number;
  displayName: string;
  solved: number;
  wrongAttempts: number;
  isMe: boolean;
};

/**
 * Saves a checked answer for today's problem. Only today's (UTC) row can be written, so a user
 * scores at most one point per mode per day. A failure is logged but never blocks the answer check.
 */
export async function recordAttempt(mode: Mode, problemId: string, correct: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("record_attempt", { p_mode: mode, p_problem_id: problemId, p_correct: correct });
  if (error) console.error("record_attempt failed:", error.message);
}

/** Ids of the problems the current user has already solved today (UTC). */
export async function getSolvedToday(): Promise<Set<string>> {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("results")
    .select("problem_id")
    .eq("day", today)
    .not("solved_at", "is", null);
  if (error) {
    console.error("getSolvedToday failed:", error.message);
    return new Set();
  }
  return new Set(data.map((row) => row.problem_id as string));
}

/** The top `limit` players for `period`, plus the current user's row if they're ranked lower. */
export async function getLeaderboard(period: LeaderboardPeriod = "all", limit = 20): Promise<LeaderboardRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("leaderboard", { p_limit: limit, p_period: period });
  if (error) throw new Error(`leaderboard failed: ${error.message}`);
  return (data as { rank: number; display_name: string; solved: number; wrong_attempts: number; is_me: boolean }[]).map(
    (row) => ({
      rank: Number(row.rank),
      displayName: row.display_name,
      solved: Number(row.solved),
      wrongAttempts: Number(row.wrong_attempts),
      isMe: row.is_me,
    }),
  );
}
