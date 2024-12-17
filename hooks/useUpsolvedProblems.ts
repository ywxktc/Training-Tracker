import { useEffect, useMemo } from "react";
import useSWR from "swr";
import { TrainingProblem } from "@/types/TrainingProblem";
import { SuccessResponse, ErrorResponse } from "@/types/Response";
import useUser from "@/hooks/useUser";
import useProblems from "@/hooks/useProblems";

const UPSOLVED_PROBLEMS_CACHE_KEY = "training-tracker-upsolved-problems";

const getStoredUpsolvedProblems = () => {
  try {
    const stored = localStorage.getItem(UPSOLVED_PROBLEMS_CACHE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const useUpsolvedProblems = () => {
  const { user } = useUser();
  const {
    isLoading: isProblemsLoading,
    refreshSolvedProblems,
    solvedProblems,
  } = useProblems(user);
  const { data, isLoading, error, mutate } = useSWR<TrainingProblem[]>(
    UPSOLVED_PROBLEMS_CACHE_KEY,
    getStoredUpsolvedProblems
  );

  // make sure the data is an array
  const upsolvedProblems = useMemo(() => data ?? [], [data]);

  useEffect(() => {
    if (upsolvedProblems) {
      localStorage.setItem(UPSOLVED_PROBLEMS_CACHE_KEY, JSON.stringify(upsolvedProblems));
    }
  }, [upsolvedProblems]);

  const addUpsolvedProblems = async (problems: TrainingProblem[]) => {
    try {
      // Filter out problems that are already in the list
      const newProblems = problems.filter(
        problem => !upsolvedProblems?.some(
          p => p.contestId === problem.contestId && p.index === problem.index
        )
      );

      if (newProblems.length === 0) {
        return SuccessResponse(upsolvedProblems);
      }

      const newUpsolvedProblems = [...(upsolvedProblems ?? []), ...newProblems];
      await mutate(newUpsolvedProblems, { revalidate: false });
      return SuccessResponse(newUpsolvedProblems);
    } catch (error) {
      return ErrorResponse(error as string);
    }
  };

  const deleteUpsolvedProblem = async (problem: TrainingProblem) => {
    try {
      const newUpsolvedProblems = upsolvedProblems?.filter((p) => p.contestId !== problem.contestId && p.index !== problem.index);
      await mutate(newUpsolvedProblems, { revalidate: false });
      return SuccessResponse(newUpsolvedProblems);
    } catch (error) {
      return ErrorResponse(error as string);
    }
  };

  const refreshUpsolvedProblems = async () => {
    await refreshSolvedProblems();
    const newUpsolvedProblems = upsolvedProblems.map((problem) => {
      const solvedProblem = solvedProblems.find(
        (p) => p.contestId === problem.contestId && p.index === problem.index
      );
      if (solvedProblem) {
        return {
          ...problem,
          solvedTime: new Date().getTime(),
        };
      }
      return problem;
    });
    await mutate(newUpsolvedProblems, { revalidate: false });
  };

  return {
    upsolvedProblems,
    isLoading: isProblemsLoading || isLoading,
    error,
    addUpsolvedProblems,
    deleteUpsolvedProblem,
    refreshUpsolvedProblems,
  };
};

export default useUpsolvedProblems;