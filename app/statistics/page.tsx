"use client";

import useHistory from "@/hooks/useHistory";
import Loader from "@/components/Loader";
import History from "@/components/History";
import ProgressChart from "@/components/ProgressChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">Statistics</CardTitle>
        <Button variant="destructive" onClick={onClearHistory}>
          Clear History
        </Button>
      </CardHeader>
      <CardContent>
        {history && history.length > 0 ? (
          <>
            <div className="w-full mb-6">
              <ProgressChart history={history} />
            </div>
            <History history={history} deleteTraining={deleteTraining} />
          </>
        ) : (
          <div className="text-center py-4 text-muted-foreground">No training history</div>
        )}
      </CardContent>
    </Card>
  );
};

export default Statistics;