import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { CodeforcesProblem, Contest, ProblemTag } from '@/types/Codeforces'
import getAllProblems from '@/utils/codeforces/getAllProblems'
import getSolvedProblems from '@/utils/codeforces/getSolvedProblems'
import { User } from '@/types/User'
import getContests from '@/utils/codeforces/getContests'

const PROBLEMS_CACHE_KEY = 'codeforces-all-problems'
const SOLVED_PROBLEMS_CACHE_KEY = (handle: string) =>
  `codeforces-solved-${handle}`

// Helper function to filter out Kotlin-only contest problems
const filterKotlinProblems = (
  problems: CodeforcesProblem[] | undefined,
  contests: Contest[] | undefined
): CodeforcesProblem[] => {
  return (
    problems?.filter((problem) => {
      const contest = contests?.find((c) => c.id === problem.contestId)
      return !contest?.name?.toLowerCase().includes('kotlin')
    }) ?? []
  )
}

// Helper function to build solved problem IDs set
const buildSolvedProblemIds = (
  solvedProblems: CodeforcesProblem[]
): Set<string> => {
  return new Set(solvedProblems.map((p) => `${p.contestId}_${p.index}`))
}

// Helper function to build mapping from problem name to solved contest IDs
const buildSolvedNameToContestIds = (
  solvedProblems: CodeforcesProblem[]
): Map<string, number[]> => {
  const solvedNameToContestIds = new Map<string, number[]>()

  for (const problem of solvedProblems) {
    const name = problem.name
    const contestId = Number(problem.contestId)

    if (!name || !Number.isFinite(contestId)) continue

    if (!solvedNameToContestIds.has(name)) {
      solvedNameToContestIds.set(name, [])
    }
    solvedNameToContestIds.get(name)!.push(contestId)
  }

  return solvedNameToContestIds
}

// Helper function to enhance solved problem IDs with approximate matches
const enhanceSolvedProblemIds = (
  allProblems: CodeforcesProblem[],
  solvedNameToContestIds: Map<string, number[]>,
  solvedProblemIds: Set<string>
): void => {
  for (const problem of allProblems) {
    const problemKey = `${problem.contestId}_${problem.index}`

    // Skip if already exactly solved
    if (solvedProblemIds.has(problemKey)) continue

    const name = problem.name
    const contestId = Number(problem.contestId)

    if (!name || !Number.isFinite(contestId)) continue

    const solvedContestIds = solvedNameToContestIds.get(name)
    if (!solvedContestIds) continue

    // Consider problem approximately solved if there's a solved problem with same name
    // and contest ID difference less than 5
    const isApproximatelySolved = solvedContestIds.some(
      (solvedContestId) => Math.abs(solvedContestId - contestId) < 5
    )

    if (isApproximatelySolved) {
      solvedProblemIds.add(problemKey)
    }
  }
}

// Helper function to categorize problems by contest ID range
const categorizeProblemsByContestRange = (
  problems: CodeforcesProblem[],
  lowerBound: number,
  upperBound: number
) => {
  return {
    inRange: problems.filter(
      (problem) =>
        problem.contestId >= lowerBound && problem.contestId <= upperBound
    ),
    outOfRange: problems.filter(
      (problem) =>
        problem.contestId < lowerBound || problem.contestId > upperBound
    )
  }
}

// Helper function to randomly select a problem from a list
const selectRandomProblem = (
  problems: CodeforcesProblem[],
  alreadyChosen: Set<string>
): CodeforcesProblem | null => {
  if (problems.length === 0) {
    return null
  }

  let selectedProblem = problems[Math.floor(Math.random() * problems.length)]
  let problemKey = `${selectedProblem.contestId}_${selectedProblem.index}`

  // Ensure we don't select the same problem twice
  while (alreadyChosen.has(problemKey)) {
    selectedProblem = problems[Math.floor(Math.random() * problems.length)]
    problemKey = `${selectedProblem.contestId}_${selectedProblem.index}`
  }

  alreadyChosen.add(problemKey)
  return selectedProblem
}

const useProblems = (user: User | null | undefined) => {
  const [isLoading, setIsLoading] = useState(false)
  const [problemPools, setProblemPools] = useState<
    {
      rating: number
      solved: CodeforcesProblem[]
      unsolved: CodeforcesProblem[]
    }[]
  >([])

  // Fetch all problems
  const { data: allProblems, isLoading: isLoadingAll } = useSWR<
    CodeforcesProblem[]
  >(
    PROBLEMS_CACHE_KEY,
    async () => {
      const res = await getAllProblems()
      if (!res.success) {
        throw new Error('Failed to fetch problems')
      }
      return res.data
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000 // 1 minute - shorter since we handle caching
    }
  )

  // Fetch all contests
  const { data: contests, isLoading: isLoadingContests } = useSWR<Contest[]>(
    'codeforces-contests',
    async () => {
      const res = await getContests()
      if (!res.success) {
        throw new Error('Failed to fetch contests')
      }
      return res.data
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000 // 1 minute - shorter since we handle caching
    }
  )

  // Fetch solved problems only if we have a user
  const {
    data: solvedProblems,
    isLoading: isLoadingSolved,
    mutate: mutateSolved
  } = useSWR<CodeforcesProblem[]>(
    user ? SOLVED_PROBLEMS_CACHE_KEY(user.codeforcesHandle) : null,
    async () => {
      if (!user) {
        throw new Error('No user')
      }
      const res = await getSolvedProblems(user)
      if (!res.success) {
        throw new Error('Failed to fetch solved problems')
      }
      return res.data
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000 // 1 minute - shorter since we handle caching
    }
  )

  // Update problem pools when problems data changes
  useEffect(() => {
    if (!user || isLoadingAll) {
      return
    }

    const ratings = [
      parseInt(user.level.P1),
      parseInt(user.level.P2),
      parseInt(user.level.P3),
      parseInt(user.level.P4)
    ]

    // Filter out Kotlin-only contest problems
    const filteredAllProblems = filterKotlinProblems(allProblems, contests)
    const filteredSolvedProblems = filterKotlinProblems(
      solvedProblems,
      contests
    )

    // Build exact solved problem IDs
    const solvedProblemIds = buildSolvedProblemIds(filteredSolvedProblems)

    // Build mapping for approximate matching
    const solvedNameToContestIds = buildSolvedNameToContestIds(
      filteredSolvedProblems
    )

    // Enhance solved problem IDs with approximate matches
    if (filteredAllProblems.length > 0 && solvedNameToContestIds.size > 0) {
      enhanceSolvedProblemIds(
        filteredAllProblems,
        solvedNameToContestIds,
        solvedProblemIds
      )
    }

    // Filter unsolved problems
    const unsolvedProblems = filteredAllProblems.filter(
      (problem) =>
        !solvedProblemIds.has(`${problem.contestId}_${problem.index}`)
    )

    // Build problem pools by rating
    const newProblemPools = ratings.map((rating) => ({
      rating,
      solved: filteredSolvedProblems.filter(
        (problem) => problem.rating === rating
      ),
      unsolved: unsolvedProblems.filter((problem) => problem.rating === rating)
    }))

    setProblemPools(newProblemPools)
  }, [user, allProblems, solvedProblems, contests, isLoadingAll])

  const refreshSolvedProblems = async () => {
    if (!user) {
      return
    }

    setIsLoading(true)

    try {
      const updatedData = await mutateSolved(
        async () => {
          const res = await getSolvedProblems(user)
          if (!res.success) {
            throw new Error('Failed to fetch solved problems')
          }
          return res.data
        },
        { revalidate: true }
      )

      setIsLoading(false)
      return updatedData
    } catch (error) {
      setIsLoading(false)
      throw error
    }
  }

  const getRandomProblems = (
    tags: ProblemTag[],
    lowerBound: number,
    upperBound: number
  ) => {
    if (!user || problemPools.length === 0) {
      return
    }

    setIsLoading(true)
    const alreadyChosen = new Set<string>()

    const newProblems = problemPools.map((pool) => {
      let selectedProblem: CodeforcesProblem | null = null

      // Filter pool by tags if provided
      let filteredPool = pool
      if (tags.length > 0) {
        filteredPool = {
          ...pool,
          solved: pool.solved.filter((problem) =>
            tags.some((tag) => problem.tags.includes(tag.value))
          ),
          unsolved: pool.unsolved.filter((problem) =>
            tags.some((tag) => problem.tags.includes(tag.value))
          )
        }
      }

      // Categorize problems by contest ID range
      const categorizedPool = {
        rating: filteredPool.rating,
        solved: categorizeProblemsByContestRange(
          filteredPool.solved,
          lowerBound,
          upperBound
        ),
        unsolved: categorizeProblemsByContestRange(
          filteredPool.unsolved,
          lowerBound,
          upperBound
        )
      }

      // Priority 1: Select from unsolved problems within range
      if (filteredPool.unsolved.length > 0) {
        if (categorizedPool.unsolved.inRange.length > 0) {
          selectedProblem = selectRandomProblem(
            categorizedPool.unsolved.inRange,
            alreadyChosen
          )
        } else if (categorizedPool.unsolved.outOfRange.length > 0) {
          selectedProblem = selectRandomProblem(
            categorizedPool.unsolved.outOfRange,
            alreadyChosen
          )
        }
      }

      // Priority 2: Select from solved problems if no unsolved available
      if (!selectedProblem && filteredPool.solved.length > 0) {
        if (categorizedPool.solved.inRange.length > 0) {
          selectedProblem = selectRandomProblem(
            categorizedPool.solved.inRange,
            alreadyChosen
          )
        } else if (categorizedPool.solved.outOfRange.length > 0) {
          selectedProblem = selectRandomProblem(
            categorizedPool.solved.outOfRange,
            alreadyChosen
          )
        }
      }

      // Format the selected problem with additional properties
      return selectedProblem
        ? {
            ...selectedProblem,
            url: `https://codeforces.com/problemset/problem/${selectedProblem.contestId}/${selectedProblem.index}`,
            solvedTime: null
          }
        : null
    })

    setIsLoading(false)
    return newProblems.filter((problem) => problem !== null)
  }

  return {
    allProblems: filterKotlinProblems(allProblems, contests),
    solvedProblems: filterKotlinProblems(solvedProblems, contests),
    isLoading:
      isLoading || isLoadingAll || isLoadingSolved || isLoadingContests,
    refreshSolvedProblems,
    getRandomProblems
  }
}

export default useProblems
