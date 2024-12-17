"use client";

import { TrainingProblem } from "@/types/TrainingProblem";
import useUpsolvedProblems from "@/hooks/useUpsolvedProblems";
import Loader from "@/components/Loader";
import Error from "@/components/Error";
import UpsolvedProblemsList from "@/components/UpsolvedProblemsList";

const Upsolve = () => {
  const { upsolvedProblems, isLoading, error, deleteUpsolvedProblem, refreshUpsolvedProblems } = useUpsolvedProblems();

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <Error />;
  }

  const onDelete = (problem: TrainingProblem) => {
    if (confirm("Are you sure you want to delete this problem?")) {
      deleteUpsolvedProblem(problem);
    }
  };

  if (!upsolvedProblems || upsolvedProblems.length === 0) {
    return <div>No problems to upsolve.</div>;
  }

  return (
    <div>
      <UpsolvedProblemsList
        upsolvedProblems={upsolvedProblems}
        onDelete={onDelete}
        onRefresh={refreshUpsolvedProblems}
      />
    </div>
  );
};

export default Upsolve;
