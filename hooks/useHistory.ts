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
    const historyStr = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (historyStr) {
      const loadedHistory: Training[] = JSON.parse(historyStr);
      loadedHistory.sort((a, b) => b.startTime - a.startTime); // 降序排序
      setHistory(loadedHistory);
    }
  }, []);

  const addTraining = (training: Training) => {
    const performance = getPerformance(training);
    const newTraining = { ...training, performance };

    const updatedHistory = [...history, newTraining].sort(
      (a, b) => b.startTime - a.startTime
    );

    setHistory(updatedHistory);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
  };

  const deleteTraining = (training: Training) => {
    const updatedHistory = history
      .filter((t) => t.startTime !== training.startTime)
      .sort((a, b) => b.startTime - a.startTime);

    setHistory(updatedHistory);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  };

  return {
    history,
    isLoading: isUserLoading,
    addTraining,
    deleteTraining,
    clearHistory,
  };
};

export default useHistory;