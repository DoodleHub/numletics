import { HomeIntro } from "@/components/problem/home-intro";
import { ListenCardSkeleton, ReadCardSkeleton } from "@/components/problem/problem-card-skeletons";
import { LoadingStatus, Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <HomeIntro streak={<Skeleton className="h-6 w-56 md:h-[29px] md:w-72" />}>
      <LoadingStatus label="Loading today’s problems" />
      <ReadCardSkeleton />
      <ListenCardSkeleton />
    </HomeIntro>
  );
}
