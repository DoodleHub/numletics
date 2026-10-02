import { Card, CardHeader } from "@/components/ui/card";
import { BookIcon, HeadphonesIcon } from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/skeleton";

/** Matches AnswerForm: input, button. */
function AnswerFormSkeleton() {
  return (
    <div className="mt-auto flex flex-col gap-5 pt-8">
      <Skeleton className="h-14 w-full md:h-control" />
      <Skeleton className="h-14 w-full md:h-control" />
    </div>
  );
}

/** Matches ReadCard. The lines approximate a problem statement's height. */
export function ReadCardSkeleton() {
  return (
    <Card>
      <CardHeader icon={BookIcon} title="Read & solve" />
      <div className="mt-8 flex max-w-[490px] flex-col gap-3 md:mt-[50px] md:gap-4">
        <Skeleton className="h-6 w-full md:h-8" />
        <Skeleton className="h-6 w-full md:h-8" />
        <Skeleton className="h-6 w-full md:h-8" />
        <Skeleton className="h-6 w-2/3 md:h-8" />
      </div>
      <AnswerFormSkeleton />
    </Card>
  );
}

/** Matches ListenCard: play button and caption. */
export function ListenCardSkeleton() {
  return (
    <Card>
      <CardHeader icon={HeadphonesIcon} title="Listen & solve" />
      <div className="mt-8 flex flex-col items-center gap-4 md:mt-[50px]">
        <Skeleton round className="size-24 md:size-play" />
        <Skeleton className="h-6 w-48 md:h-7 md:w-56" />
      </div>
      <AnswerFormSkeleton />
    </Card>
  );
}
