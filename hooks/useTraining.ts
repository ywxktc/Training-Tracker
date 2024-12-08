import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import useUser from "@/hooks/useUser";
import useProblems from "@/hooks/useProblems";
import { TrainingProblem } from "@/types/TrainingProblem";
import { CodeforcesProblem } from "@/types/Codeforces";
import { Training } from "@/types/Training";
import useHistory from "@/hooks/useHistory";

const TRAINING_STORAGE_KEY = "training-tracker-training";

const useTraining = () => {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useUser();
  const { addTraining } = useHistory();
  const {
    allProblems,
    solvedProblems,
    isLoading: isProblemsLoading,
    refreshSolvedProblems,
  } = useProblems(user);

  const [problemPools, setProblemPools] = useState<{
    rating: number;
    problems: CodeforcesProblem[];
  }[]>([]);
  const [problems, setProblems] = useState<TrainingProblem[]>([]);
  const [training, setTraining] = useState<Training | null>(null);
  const [isTraining, setIsTraining] = useState(false);

  const timerRef = useRef<NodeJS.Timeout>();

  const updateProblemStatus = useCallback(() => {
    const solvedProblemIds = new Set(
      solvedProblems.map((p) => `${p.contestId}_${p.index}`)
    );

    setTraining(prev => {
      if (!prev) {
        return null;
      }
      
      const updatedProblems = prev.problems.map(problem => ({
        ...problem,
        solvedTime: solvedProblemIds.has(`${problem.contestId}_${problem.index}`)
          ? problem.solvedTime ?? new Date().getTime()
          : problem.solvedTime
      }));

      // Only update if there are changes
      if (JSON.stringify(prev.problems) === JSON.stringify(updatedProblems)) {
        return prev;
      }

      const updatedTraining = {
        ...prev,
        problems: updatedProblems
      };

      localStorage.setItem(TRAINING_STORAGE_KEY, JSON.stringify(updatedTraining));
      return updatedTraining;
    });
  }, [solvedProblems]);

  const refreshProblemStatus = useCallback(async () => {
    await refreshSolvedProblems();
    updateProblemStatus();
  }, [refreshSolvedProblems, updateProblemStatus]);

  const finishTraining = useCallback(async () => {
    // Immediately set training state to false to prevent any race conditions
    setIsTraining(false);
    
    // Clear any existing timer first
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }

    // Capture current training value before clearing state
    const currentTraining = training;
    
    // Clear all training-related states immediately
    setProblems([]);
    setTraining(null);
    localStorage.removeItem(TRAINING_STORAGE_KEY);

    // Only proceed with history update if there was an active training
    if (!currentTraining) {
      return;
    }

    const latestSolvedProblems = await refreshSolvedProblems();

    if (!latestSolvedProblems) {
      return;
    }

    const solvedProblemIds = new Set(
      latestSolvedProblems.map((p) => `${p.contestId}_${p.index}`)
    );

    const updatedProblems = currentTraining.problems.map(problem => ({
      ...problem,
      solvedTime: solvedProblemIds.has(`${problem.contestId}_${problem.index}`)
        ? problem.solvedTime ?? new Date().getTime()
        : problem.solvedTime
    }));  

    addTraining({ ...currentTraining, problems: updatedProblems });
    router.push("/statistics");
  }, [training, addTraining, router, refreshSolvedProblems]);

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
    if (!training) {
      // Ensure cleanup when training becomes null
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = undefined;
      }
      return;
    }

    localStorage.setItem(TRAINING_STORAGE_KEY, JSON.stringify(training));
    const now = new Date().getTime();
    const timeLeft = training.endTime - now;

    // If training has expired, finish it
    if (timeLeft <= 0) {
      finishTraining();
      return;
    }

    setIsTraining(now <= training.endTime);

    // Store timer ID in the ref
    timerRef.current = setTimeout(() => {
      finishTraining();
    }, timeLeft);

    // Clean up timer when training changes or component unmounts
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = undefined;
      }
    };
  }, [training, finishTraining]);

  // if all problems are solved, finish training
  useEffect(() => {
    if (training && training.problems.every((p) => p.solvedTime)) {
      finishTraining();
    }
  }, [training, finishTraining]);

  // Update training problems status whenever solvedProblems changes
  useEffect(() => {
    if (!isTraining || !training || !solvedProblems) {
      return;
    }

    updateProblemStatus();
  }, [isTraining, training, solvedProblems, updateProblemStatus]);

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

    // Will start in 30 seconds
    const startTime = new Date().getTime() + 10000;

    const endTime = startTime + parseInt(user.level.time) * 60000;

    setTraining({
      startTime,
      endTime,
      level: user.level,
      problems,
      performance: 0,
    });
  };

  const stopTraining = () => {
    setIsTraining(false);
    setTraining(null);
    localStorage.removeItem(TRAINING_STORAGE_KEY);
  };

  return {
    problems,
    generateProblems,
    isLoading: isUserLoading || isProblemsLoading,

    training,
    isTraining,
    startTraining,
    stopTraining,
    refreshProblemStatus,
    finishTraining,
  };
};

export default useTraining;