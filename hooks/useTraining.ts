import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useUser from "@/hooks/useUser";
import useProblems from "@/hooks/useProblems";
import { TrainingProblem } from "@/types/TrainingProblem";
import { CodeforcesProblem } from "@/types/Codeforces";
import { Training } from "@/types/Training";

const TRAINING_STORAGE_KEY = "training";

const useTraining = () => {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useUser();
  const { allProblems, solvedProblems, isLoading: isProblemsLoading } =
    useProblems(user);

  const [problemPools, setProblemPools] = useState<{
    rating: number;
    problems: CodeforcesProblem[];
  }[]>([]);
  const [problems, setProblems] = useState<TrainingProblem[]>([]);
  const [training, setTraining] = useState<Training | null>(null);
  const [isTraining, setIsTraining] = useState(false);

  // Redirect if no user
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/");
    }
  }, [user, isUserLoading, router]);

  // Load training from localStorage
  useEffect(() => {
    const localTraining = localStorage.getItem(TRAINING_STORAGE_KEY);
    if (localTraining) {
      const parsed = JSON.parse(localTraining);
      setTraining(parsed);
      setIsTraining(new Date().getTime() <= parsed.endTime);
    }
  }, []);

  // Update problem pools when problems data changes
  useEffect(() => {
    if (!user || isProblemsLoading) {
      return;
    }

    const ratings = [
      parseInt(user.level.P1),
      parseInt(user.level.P2),
      parseInt(user.level.P3),
      parseInt(user.level.P4),
    ];

    const solvedProblemIds = new Set(
      solvedProblems.map((p) => `${p.contestId}_${p.index}`)
    );

    const unsolvedProblems = allProblems.filter(
      (problem) => !solvedProblemIds.has(`${problem.contestId}_${problem.index}`)
    );

    const newProblemPools = ratings.map((rating) => ({
      rating,
      problems: unsolvedProblems.filter((problem) => problem.rating === rating),
    }));

    setProblemPools(newProblemPools);
  }, [user, allProblems, solvedProblems, isProblemsLoading]);

  // Update training in localStorage
  useEffect(() => {
    if (training) {
      localStorage.setItem(TRAINING_STORAGE_KEY, JSON.stringify(training));
      const now = new Date().getTime();
      setIsTraining(now <= training.endTime);
    }
  }, [training]);

  const generateProblems = () => {
    if (!user || problemPools.length === 0) return;

    const newProblems = problemPools.map((pool) => {
      const problem = pool.problems[Math.floor(Math.random() * pool.problems.length)];
      return {
        ...problem,
        url: `https://codeforces.com/contest/${problem.contestId}/problem/${problem.index}`,
        solvedTime: null,
      };
    });

    setProblems(newProblems);
  };

  const startTraining = () => {
    if (!user) {
      router.push("/");
      return;
    }

    const startTime = new Date().getTime() + 30000;
    const endTime = startTime + parseInt(user.level.time) * 60000;

    setTraining({
      startTime,
      endTime,
      level: user.level,
      problems,
    });
  };

  const stopTraining = () => {
    if (confirm("Are you sure to stop the training?")) {
      setIsTraining(false);
      setTraining(null);
      localStorage.removeItem(TRAINING_STORAGE_KEY);
    }
  };

  return {
    problems,
    generateProblems,
    isLoading: isUserLoading || isProblemsLoading,

    training,
    isTraining,
    startTraining,
    stopTraining,
  };
};

export default useTraining;