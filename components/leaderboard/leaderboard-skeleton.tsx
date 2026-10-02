import { Card, CardHeader } from "@/components/ui/card";
import { TrophyIcon } from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/skeleton";

const ROWS = 8;

/** Matches the leaderboard card: title, then a table of rank, player and solved. */
export function LeaderboardSkeleton() {
  return (
    <Card>
      <CardHeader icon={TrophyIcon} title={<Skeleton className="h-8 w-40 md:h-11 md:w-56" />} />
      <div className="mt-8 md:mt-[50px]">
        <div className="flex justify-between pb-3">
          <Skeleton className="h-5 w-12 md:h-6 md:w-16" />
          <Skeleton className="h-5 w-14 md:h-6 md:w-20" />
        </div>
        {Array.from({ length: ROWS }, (_, i) => (
          <div key={i} className="flex items-center gap-4 border-t border-line py-3 md:py-4">
            <Skeleton className="h-7 w-8 shrink-0 md:h-8 md:w-12" />
            {/* Vary the name widths so the list doesn't look like a grid. */}
            <Skeleton className={`h-7 md:h-8 ${["w-2/5", "w-1/2", "w-1/3"][i % 3]}`} />
            <Skeleton className="ml-auto h-7 w-10 shrink-0 md:h-8 md:w-14" />
          </div>
        ))}
      </div>
    </Card>
  );
}
