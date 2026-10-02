import { Card, CardHeader } from "@/components/ui/card";
import { BookIcon } from "@/components/ui/icons";
import type { PublicProblem, SolvedProblem } from "@/lib/problems";
import { AnswerForm } from "./answer-form";

export function ReadCard({ problem, solved }: { problem: PublicProblem; solved?: SolvedProblem }) {
  return (
    <Card>
      <CardHeader icon={BookIcon} title="Read & solve" />
      <p className="mt-8 max-w-[490px] text-[1.375rem] leading-normal md:mt-[50px] md:text-problem">
        {problem.text}
      </p>
      <AnswerForm problemId={problem.id} solved={solved} label="Answer to the reading problem" />
    </Card>
  );
}
