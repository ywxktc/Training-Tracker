import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import useUser from "@/hooks/useUser";
import { CodeforcesProblem } from "@/types/Codeforces";
import { TrainingProblem } from "@/types/TrainingProblem";
import { Training } from "@/types/Training";

import getAllProblems from "@/utils/codeforces/getAllProblems";
import getSolvedProblems from "@/utils/codeforces/getSolvedProblems";

const useTraining = () => {

  const router = useRouter();
  const { user, isLoading: isUserLoading } = useUser();

  const [allProblems, setAllProblems] = useState<CodeforcesProblem[]>([]);
  const [solvedProblems, setSolvedProblems] = useState<CodeforcesProblem[]>([]);
  const [problemPools, setProblemPools] = useState<{
    rating: number;
    problems: CodeforcesProblem[];
  }[]>([]);
  const [problems, setProblems] = useState<TrainingProblem[]>([]);

  const [training, setTraining] = useState<Training | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/");
      return;
    }

    const localTraining = localStorage.getItem("training");
    if (localTraining) {
      setTraining(JSON.parse(localTraining));
      setIsTraining(true);
    }

    if (user) {
      const initProblems = async () => {
        setIsLoading(true);
        const problems = await getAllProblems();
        setAllProblems(problems);
        const solvedProblems = await getSolvedProblems(user);
        setSolvedProblems(solvedProblems);

        console.log(solvedProblems);

        setIsLoading(false);
      };
      initProblems();
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (!user) {
      setProblemPools([]);
      return;
    }

    const ratings = [
      parseInt(user.level.P1),
      parseInt(user.level.P2),
      parseInt(user.level.P3),
      parseInt(user.level.P4),
    ];


    const unsolvedProblems = (() => {
      const solvedProblemIds = new Set(
        solvedProblems.map((p) => `${p.contestId}_${p.index}`)
      );
  
      return allProblems.filter(
        (problem) => !solvedProblemIds.has(`${problem.contestId}_${problem.index}`)
      );
    })();

    const problemPools = ratings.map((rating) => {
      return {
        rating,
        problems: unsolvedProblems.filter(
          (problem) => problem.rating === rating
        ),
      };
    });

    setProblemPools(problemPools);

  }, [user, allProblems, solvedProblems]);

  const generateProblems = () => {
    if (!user) {
      return [];
    }

    const problems = problemPools.map((pool) => {
      return pool.problems[Math.floor(Math.random() * pool.problems.length)];
    }).map((problem) => {
      return {
        ...problem,
        url: `https://codeforces.com/contest/${problem.contestId}/problem/${problem.index}`,
        solvedTime: null,
      };
    });

    setProblems(problems);
  };

  useEffect(() => {
    if (training) {
      localStorage.setItem("training", JSON.stringify(training));
      const now = new Date().getTime();
      if (now > training.endTime) {
        setIsTraining(false);
      } else {
        setIsTraining(true);
      }
    }

  }, [training]);

  const startTraining = () => {
    if (!user) {
      router.push("/");
      return;
    }

    // start training in 30 seconds
    // duration is level.time * 60 seconds
    const startTime = new Date().getTime() + 30000;
    const endTime = startTime + parseInt(user.level.time) * 60000;

    setTraining({
      startTime,
      endTime,
      level: user.level,
      problems: problems,
    });
  };

  const stopTraining = () => {
    if (confirm("Are you sure to stop the training?")) {
      setIsTraining(false);
      localStorage.removeItem("training");
    }
  };

  return {
    problems,
    generateProblems,
    startTraining,
    stopTraining,
    training,
    isTraining,
    isLoading,
  };
};

export default useTraining;
