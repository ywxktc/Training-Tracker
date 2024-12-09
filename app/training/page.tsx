"use client";

import useUser from "@/hooks/useUser";
import useTraining from "@/hooks/useTraining";
import Trainer from "@/components/Trainer";
import TagSelector from "@/components/TagSelector";
import Loader from "@/components/Loader";
import Error from "@/components/Error";
import useTags from "@/hooks/useTags";
const Training = () => {
  const { user } = useUser();

  const {
    allTags,
    selectedTags,
    onTagClick,
    onClearTags,
  } = useTags();

  const {
    startTraining,
    stopTraining,
    problems,
    training,
    isTraining,
    isLoading,
    refreshProblemStatus,
    finishTraining,
    generateProblems,
  } = useTraining();

  if (isLoading) {
    return <Loader />;
  }

  if (!user || !problems) {
    return <Error />;
  }

  return (
    <div className="w-full flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Let&apos;s Practice!</h1>
      <div className="w-full flex gap-4">
        <div className="w-full flex flex-row gap-2">
          <div>
            <span className="font-bold">Level:</span> {user?.level.level} |
          </div>
          <div>
            <span className="font-bold">Performance:</span> {user?.level.Performance} |
          </div>
          <div>
            <span className="font-bold">Time:</span> {user?.level.time} minutes
          </div>
        </div>
      </div>
      <TagSelector
        allTags={allTags}
        selectedTags={selectedTags}
        onTagClick={onTagClick}
        onClearTags={onClearTags}
      />
      <div className="w-full flex flex-row">
        <div className="w-1/4 text-left">
          <span className="font-bold">P1:</span> {user?.level.P1}
        </div>
        <div className="w-1/4 text-left">
          <span className="font-bold">P2:</span> {user?.level.P2}
        </div>
        <div className="w-1/4 text-left">
          <span className="font-bold">P3:</span> {user?.level.P3}
        </div>
        <div className="w-1/4 text-left">
          <span className="font-bold">P4:</span> {user?.level.P4}
        </div>
      </div>
      <Trainer
        isTraining={isTraining}
        training={training}
        problems={problems}
        generateProblems={generateProblems}
        startTraining={startTraining}
        stopTraining={stopTraining}
        refreshProblemStatus={refreshProblemStatus}
        finishTraining={finishTraining}
        selectedTags={selectedTags}
      />
    </div>
  );
};

export default Training;
