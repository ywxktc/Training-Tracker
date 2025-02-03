import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import useUser from "@/hooks/useUser";
import useProblems from "@/hooks/useProblems";
import { TrainingProblem } from "@/types/TrainingProblem";
import { Training } from "@/types/Training";
import { ProblemTag } from "@/types/Codeforces";
import useHistory from "@/hooks/useHistory";
import useUpsolvedProblems from "@/hooks/useUpsolvedProblems";

const TRAINING_STORAGE_KEY = "training-tracker-training";

const useTraining = () => {
  const router = useRouter();
  const {
    user,
    isLoading: isUserLoading,
    updateUserLevel,
  } = useUser();
  const {
    solvedProblems,
    isLoading: isProblemsLoading,
    refreshSolvedProblems,
    getRandomProblems,
  } = useProblems(user);
  const { addTraining } = useHistory();
  const { addUpsolvedProblems } = useUpsolvedProblems();


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

    // if solved all problems, user level +1
    // otherwise, user level -1
    const delta = updatedProblems.every((p) => p.solvedTime) ? 1 : -1;
    updateUserLevel({ delta });

    // Add unsolved problems to upsolved problems list
    const unsolvedProblems = updatedProblems.filter(p => !p.solvedTime);
    addUpsolvedProblems(unsolvedProblems);

    router.push("/statistics");

  }, [training, addTraining, router, refreshSolvedProblems, updateUserLevel, addUpsolvedProblems]);

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

  const generateProblems = (tags: ProblemTag[], lb: number, ub: number) => {
    const newProblems = getRandomProblems(tags, lb, ub);
    if (newProblems) {
      setProblems(newProblems);
    }
  };

  return {
    problems,
    isLoading: isUserLoading || isProblemsLoading,

    training,
    isTraining,
    generateProblems,
    startTraining,
    stopTraining,
    refreshProblemStatus,
    finishTraining,
  };
};

export default useTraining;