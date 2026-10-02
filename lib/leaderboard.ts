import "server-only";
import type { Mode } from "./problems";
import { createClient } from "./supabase/server";

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

/** The top `limit` players, plus the current user's row if they're ranked lower. */
export async function getLeaderboard(limit = 20): Promise<LeaderboardRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("leaderboard", { p_limit: limit });
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
