import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useUser from "@/hooks/useUser";
import { Training } from "@/types/Training";
import getPerformance from "@/utils/getPerformance";

const HISTORY_STORAGE_KEY = "training-tracker-history";

const useHistory = () => {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useUser();
  const [history, setHistory] = useState<Training[]>([]);
  // Redirect if no user
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/");
    }
  }, [user, isUserLoading, router]);

  // Load history from localStorage
  useEffect(() => {
    const history = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (history) {
      setHistory(JSON.parse(history));
    }
  }, []);

  const addTraining = (training: Training) => {
    const performance = getPerformance(training);

    const newTraining = { ...training, performance };

    setHistory((prev) => [...prev, newTraining]);

    localStorage.setItem(
      HISTORY_STORAGE_KEY,
      JSON.stringify([...history, newTraining])
    );
  };

  const deleteTraining = (training: Training) => {
    setHistory((prev) => prev.filter((t) => t.startTime !== training.startTime));
    localStorage.setItem(
      HISTORY_STORAGE_KEY,
      JSON.stringify(history.filter((t) => t.startTime !== training.startTime))
    );
  };

  return {
    history,
    isLoading: isUserLoading,

    addTraining,
    deleteTraining,
  };
};

export default useHistory;
