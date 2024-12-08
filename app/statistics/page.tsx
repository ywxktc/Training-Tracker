"use client";

import useHistory from "@/hooks/useHistory";
import Loader from "@/components/Loader";
import History from "@/components/History";
import ProgressChart from "@/components/ProgressChart";

const Statistics = () => {
  const { history, isLoading, deleteTraining } = useHistory();

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="w-full flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Statistics</h1>
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
