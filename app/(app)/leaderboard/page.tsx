import type { Metadata } from "next";
import { LeaderboardIntro } from "@/components/leaderboard/leaderboard-intro";
import { MonthReset } from "@/components/leaderboard/month-reset";
import { Card, CardHeader } from "@/components/ui/card";
import { TrophyIcon } from "@/components/ui/icons";
import { getLeaderboard, type LeaderboardPeriod, type LeaderboardRow } from "@/lib/leaderboard";
import { requireUser } from "@/lib/supabase/user";

export const metadata: Metadata = { title: "Leaderboard — Numletics" };

const TOP = 20;

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireUser();
  const period: LeaderboardPeriod = (await searchParams).period === "month" ? "month" : "all";
  const rows = await getLeaderboard(period, TOP);
  const top = rows.filter((row) => row.rank <= TOP);
  // The current user's row, when they're ranked below the top list.
  const me = rows.find((row) => row.isMe && row.rank > TOP);

  return (
    <LeaderboardIntro>
      <Card>
        <CardHeader icon={TrophyIcon} title={period === "month" ? currentMonth() : "All-time"} />
        {period === "month" && <MonthReset />}
        {top.length === 0 ? (
          <p className="mt-8 text-base text-muted md:mt-[50px] md:text-caption">
            {period === "month"
              ? "No one has solved a problem this month yet. Be the first."
              : "No one has solved a problem yet. Be the first."}
          </p>
        ) : (
          <table className="mt-8 w-full table-fixed text-lg md:mt-[50px] md:text-control">
            <thead className="text-left text-base text-muted md:text-caption">
              <tr>
                <th scope="col" className="w-12 pb-3 font-normal md:w-20">
                  Rank
                </th>
                <th scope="col" className="pb-3 font-normal">
                  Player
                </th>
                <th scope="col" className="w-20 pb-3 text-right font-normal md:w-28">
                  Solved
                </th>
              </tr>
            </thead>
            <tbody>
              {top.map((row) => (
                <Row key={row.rank} row={row} />
              ))}
              {me && (
                <>
                  <tr aria-hidden="true">
                    <td colSpan={3} className="border-t border-line py-2 text-center text-muted">
                      …
                    </td>
                  </tr>
                  <Row row={me} />
                </>
              )}
            </tbody>
          </table>
        )}
      </Card>
    </LeaderboardIntro>
  );
}

/** e.g. "October 2026". Months follow UTC, like the daily rotation. */
function currentMonth() {
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date());
}

function Row({ row }: { row: LeaderboardRow }) {
  return (
    <tr className={`border-t border-line ${row.isMe ? "font-bold" : ""}`}>
      <td className="py-3 tabular-nums md:py-4">{row.rank}</td>
      <td className="truncate py-3 pr-4 md:py-4">
        {row.displayName}
        {row.isMe && <span className="font-normal text-muted"> (you)</span>}
      </td>
      <td className="py-3 text-right tabular-nums md:py-4">{row.solved}</td>
    </tr>
  );
}
