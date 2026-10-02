import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/site-header";
import { Card, CardHeader } from "@/components/ui/card";
import { TrophyIcon } from "@/components/ui/icons";
import { getLeaderboard, type LeaderboardRow } from "@/lib/leaderboard";
import { requireUser } from "@/lib/supabase/user";

export const metadata: Metadata = { title: "Leaderboard — Numletics" };

const TOP = 20;

export default async function LeaderboardPage() {
  const user = await requireUser();
  const rows = await getLeaderboard(TOP);
  const top = rows.filter((row) => row.rank <= TOP);
  // The current user's row, when they're ranked below the top list.
  const me = rows.find((row) => row.isMe && row.rank > TOP);

  return (
    <div className="flex flex-1 flex-col px-4 md:px-[77px]">
      <SiteHeader user={user} />
      <main className="mx-auto flex w-full max-w-board flex-col items-center pt-12 md:pt-[104px]">
        <h1 className="text-center text-[2.5rem] font-bold leading-[1.1] tracking-[-0.02em] md:text-display">
          Leaderboard.
        </h1>
        <p className="mt-4 text-center text-base text-muted md:mt-6 md:text-caption">
          One point for each daily problem you solve. Ties go to fewer wrong answers.
        </p>
        <div className="mt-8 w-full md:mt-[50px]">
          <Card>
            <CardHeader icon={TrophyIcon} title="All-time" />
            {top.length === 0 ? (
              <p className="mt-8 text-base text-muted md:mt-[50px] md:text-caption">
                No one has solved a problem yet. Be the first.
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
        </div>
      </main>
      <footer className="py-10 text-center text-base text-muted md:pt-[50px] md:text-caption">
        Two problems. Every day.
      </footer>
    </div>
  );
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
