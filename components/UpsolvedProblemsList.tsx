import { TrainingProblem } from "@/types/TrainingProblem";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Trash2, RefreshCw } from "lucide-react";

const UpsolvedProblemsList = ({
  upsolvedProblems,
  onDelete,
  onRefresh,
}: {
  upsolvedProblems: TrainingProblem[];
  onDelete: (problem: TrainingProblem) => void;
  onRefresh: () => void;
}) => {
  return (
    <div className="w-full flex flex-col gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        className="self-start"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Refresh
      </Button>
      {upsolvedProblems.map((problem) => (
        <div
          key={problem.contestId + problem.index}
          className="w-full flex items-center justify-between"
        >
          <Link
            className="text-sm text-blue-500 hover:text-blue-600"
            href={problem.url}
            target="_blank"
          >
            {problem.solvedTime ? "✅ " : "❌ "} {problem.name}
          </Link>
          <Button variant="ghost" size="sm" onClick={() => onDelete(problem)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
};

export default UpsolvedProblemsList;
