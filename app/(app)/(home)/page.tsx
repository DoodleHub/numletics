import { connection } from "next/server";
import { HomeIntro } from "@/components/problem/home-intro";
import { ListenCard } from "@/components/problem/listen-card";
import { ReadCard } from "@/components/problem/read-card";
import { getSolvedToday } from "@/lib/leaderboard";
import { getDailyProblem, getSolvedState } from "@/lib/problems";
import { requireUser } from "@/lib/supabase/user";

export default async function Home() {
  // Render per request so the daily rotation follows the current date, not the build date.
  await connection();
  await requireUser();
  const read = getDailyProblem("read");
  const listen = getDailyProblem("listen");
  const solved = await getSolvedToday();

  return (
    <HomeIntro>
      <ReadCard problem={read} solved={getSolvedState(read.id, solved)} />
      <ListenCard problem={listen} solved={getSolvedState(listen.id, solved)} />
    </HomeIntro>
  );
}
