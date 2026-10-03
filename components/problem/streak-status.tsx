import { FlameIcon } from "@/components/ui/icons";
import type { Streak } from "@/lib/leaderboard";

/** One line under the countdown: the current streak, and whether today still needs a solve to keep it. */
export function StreakStatus({ streak }: { streak: Streak }) {
  const { days, solvedToday } = streak;
  const count = `${days}-day streak`;

  return (
    <p className="flex items-center justify-center gap-2 text-base text-muted md:text-caption">
      <FlameIcon className={`size-5 shrink-0 text-ink md:size-6 ${days > 0 && solvedToday ? "fill-accent" : ""}`} />
      {days === 0 ? (
        <span>Solve a problem to start a streak</span>
      ) : solvedToday ? (
        <span>
          <strong className="font-bold text-ink">{count}</strong>. See you tomorrow!
        </span>
      ) : (
        <span>
          <strong className="font-bold text-ink">{count}</strong>. Solve one today to keep it.
        </span>
      )}
    </p>
  );
}
