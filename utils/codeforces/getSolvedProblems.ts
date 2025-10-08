import { User } from '@/types/User'
import { CodeforcesProblem, CodeforcesSubmission } from '@/types/Codeforces'
import { SuccessResponse, ErrorResponse, Response } from '@/types/Response'
import getSubmissions from '@/utils/codeforces/getSubmissions'
import { getFromCache, setToCache } from '@/utils/cache'

const getSolvedProblemsCacheKey = (user: User) =>
  `codeforces-solved-${user.codeforcesHandle}`

const fetchSolvedProblems = async (
  user: User
): Promise<Response<CodeforcesProblem[]>> => {
  try {
    const res = await getSubmissions(user)
    if (!res.success) {
      return ErrorResponse(res.error)
    }
    const submissions = res.data
    const problems = submissions
      .filter((submission: CodeforcesSubmission) => submission.verdict === 'OK')
      .map((submission: CodeforcesSubmission) => submission.problem)

    return SuccessResponse(problems)
  } catch (error) {
    return ErrorResponse((error as Error).message)
  }
}

const getSolvedProblems = async (
  user: User
): Promise<Response<CodeforcesProblem[]>> => {
  const CACHE_KEY = getSolvedProblemsCacheKey(user)

  // Try to get from cache first
  const cachedSolvedProblems = getFromCache<CodeforcesProblem[]>(CACHE_KEY)

  // If cache exists, return immediately and refresh in background
  if (cachedSolvedProblems) {
    // Start async refresh in background (don't await)
    fetchSolvedProblems(user)
      .then((freshData) => {
        if (freshData.success) {
          setToCache(CACHE_KEY, freshData.data)
        }
      })
      .catch((error) => {
        console.error('Background refresh failed for solved problems:', error)
      })

    return SuccessResponse(cachedSolvedProblems)
  }

  // No cache exists, fetch synchronously
  const freshData = await fetchSolvedProblems(user)
  if (freshData.success) {
    setToCache(CACHE_KEY, freshData.data)
  }
  return freshData
}

export default getSolvedProblems
