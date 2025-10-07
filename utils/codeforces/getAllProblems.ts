import { CodeforcesProblem } from '@/types/Codeforces';
import { SuccessResponse, ErrorResponse, Response } from '@/types/Response';
import { getFromCache, setToCache } from '@/utils/cache';

// Filter out Kotlin, Microsoft Q# and April Fools Day Contests
const filteredContestIds = [
  171, 290, 409, 784, 952, 1145, 1171, 1170, 1212, 1211, 1298, 1297, 1331, 1347,
  1346, 1489, 1488, 1505, 1532, 1533, 1570, 1571, 1663, 1812, 1911, 1910, 1952,
  1959, 1958, 2012, 2011, 1001, 1002, 1115, 1116, 1356, 1357,
];

const CACHE_KEY = 'codeforces-all-problems';

const fetchAllProblems = async (): Promise<Response<CodeforcesProblem[]>> => {
  try {
    const res = await fetch('https://codeforces.com/api/problemset.problems');
    const data = await res.json();
    if (data.status !== 'OK') {
      return ErrorResponse('Failed to fetch problems');
    }
    const problems = data.result.problems
      .filter((problem: CodeforcesProblem) => problem.contestId >= 700)
      .filter(
        (problem: CodeforcesProblem) =>
          !filteredContestIds.includes(problem.contestId)
      );
    return SuccessResponse(problems);
  } catch (error) {
    return ErrorResponse((error as Error).message);
  }
};

const getAllProblems = async (): Promise<Response<CodeforcesProblem[]>> => {
  // Try to get from cache first
  const cachedProblems = getFromCache<CodeforcesProblem[]>(CACHE_KEY);

  // If cache exists, return immediately and refresh in background
  if (cachedProblems) {
    // Start async refresh in background (don't await)
    fetchAllProblems()
      .then((freshData) => {
        if (freshData.success) {
          setToCache(CACHE_KEY, freshData.data);
        }
      })
      .catch((error) => {
        console.error('Background refresh failed for all problems:', error);
      });

    return SuccessResponse(cachedProblems);
  }

  // No cache exists, fetch synchronously
  const freshData = await fetchAllProblems();
  if (freshData.success) {
    setToCache(CACHE_KEY, freshData.data);
  }
  return freshData;
};

export default getAllProblems;
