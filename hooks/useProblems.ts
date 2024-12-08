import { useState } from "react";
import useSWR from "swr";
import { CodeforcesProblem } from "@/types/Codeforces";
import getAllProblems from "@/utils/codeforces/getAllProblems";
import getSolvedProblems from "@/utils/codeforces/getSolvedProblems";
import { User } from "@/types/User";

const PROBLEMS_CACHE_KEY = "codeforces-all-problems";
const SOLVED_PROBLEMS_CACHE_KEY = (handle: string) =>
  `codeforces-solved-${handle}`;

const useProblems = (user: User | null | undefined) => {
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all problems
  const { data: allProblems, isLoading: isLoadingAll } = useSWR<CodeforcesProblem[]>(
    PROBLEMS_CACHE_KEY,
    async () => {
      const res = await getAllProblems();
      if (!res.success) {
        throw new Error("Failed to fetch problems");
      }
      return res.data;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 3600000,
    }
  );

  // Fetch solved problems only if we have a user
  const {
    data: solvedProblems,
    isLoading: isLoadingSolved,
    mutate: mutateSolved
  } = useSWR<CodeforcesProblem[]>(
    user ? SOLVED_PROBLEMS_CACHE_KEY(user.codeforcesHandle) : null,
    async () => {
      if (!user) {
        throw new Error("No user");
      }
      const res = await getSolvedProblems(user);
      if (!res.success) {
        throw new Error("Failed to fetch solved problems");
      }
      return res.data;
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000,
    }
  );

  const refreshSolvedProblems = async () => {
    if (!user) {
      return;
    }

    setIsLoading(true);

    try {
      // Await the mutation and capture the updated data
      const updatedData = await mutateSolved(async () => {
        const res = await getSolvedProblems(user);
        if (!res.success) {
          throw new Error("Failed to fetch solved problems");
        }
        return res.data;
      }, { revalidate: true });

      setIsLoading(false);
      // Return the updated data so caller can use it immediately
      return updatedData;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  return {
    allProblems: allProblems ?? [],
    solvedProblems: solvedProblems ?? [],
    isLoading: isLoading || isLoadingAll || isLoadingSolved,

    refreshSolvedProblems,
  };
};

export default useProblems;