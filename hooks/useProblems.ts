import useSWR from "swr";
import { CodeforcesProblem } from "@/types/Codeforces";
import getAllProblems from "@/utils/codeforces/getAllProblems";
import getSolvedProblems from "@/utils/codeforces/getSolvedProblems";
import { User } from "@/types/User";

const PROBLEMS_CACHE_KEY = "codeforces-all-problems";
const SOLVED_PROBLEMS_CACHE_KEY = (handle: string) =>
  `codeforces-solved-${handle}`;

const useProblems = (user: User | null | undefined) => {
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

  return {
    allProblems: allProblems ?? [],
    solvedProblems: solvedProblems ?? [],
    isLoading: isLoadingAll || isLoadingSolved,
  };
};

export default useProblems;