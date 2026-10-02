import { LeaderboardIntro } from "@/components/leaderboard/leaderboard-intro";
import { LeaderboardSkeleton } from "@/components/leaderboard/leaderboard-skeleton";
import { LoadingStatus } from "@/components/ui/skeleton";

// Also shows when switching tabs, because a new ?period renders a new page segment.
export default function Loading() {
  return (
    <LeaderboardIntro>
      <LoadingStatus label="Loading leaderboard" />
      <LeaderboardSkeleton />
    </LeaderboardIntro>
  );
}
