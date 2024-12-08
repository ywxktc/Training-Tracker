"use client";

import useHistory from "@/hooks/useHistory";
import Loader from "@/components/Loader";
import History from "@/components/History";
import ProgressChart from "@/components/ProgressChart";

const Statistics = () => {
  const { history, isLoading, deleteTraining, clearHistory } = useHistory();

  if (isLoading) {
    return <Loader />;
  }

  const onClearHistory = () => {
    if (
      confirm(
        "Are you sure to clear the history? This action cannot be undone."
      )
    ) {
      clearHistory();
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex flex-row justify-between items-center">
        <h1 className="text-2xl font-bold">Statistics</h1>
        <button
          className="bg-red-500 hover:bg-red-700 text-white rounded-md p-2 transition-colors duration-300"
          onClick={onClearHistory}
        >
          Clear History
        </button>
      </div>
      <div className="w-full flex justify-center">
        <ProgressChart history={history} />
      </div>
      <div className="w-full flex flex-col gap-4">
        {history && history.length > 0 ? (
          <History history={history} deleteTraining={deleteTraining} />
        ) : (
          <div>No training history</div>
        )}
      </div>
    </div>
  );
};

export default Statistics;
