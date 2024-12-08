import Link from "next/link";
import { TrainingProblem } from "@/types/TrainingProblem";
import { Training } from "@/types/Training";
import CountDown from "@/components/CountDown";

const ProblemLink = ({
  problem,
  isTraining,
  startTime,
}: {
  problem: TrainingProblem;
  isTraining: boolean;
  startTime: number | null;
}) => {
  const getSolvedStatus = () => {
    if (!isTraining) return "";
    if (problem.solvedTime && startTime) {
      const solvedMinutes = Math.floor((problem.solvedTime - startTime) / 60000);
      return `✅ ${solvedMinutes}m `;
    }
    return "⌛ ";
  };

  return (
    <div className="w-1/4 flex items-center text-left">
      <Link
        className="text-blue-500 hover:underline duration-300"
        href={problem.url}
        target="_blank"
      >
        {getSolvedStatus()}
        {problem.contestId}-{problem.index}
      </Link>
    </div>
  );
};

const Trainer = ({
  isTraining,
  training,
  problems,
  generateProblems,
  startTraining,
  stopTraining,
  refreshProblemStatus,
}: {
  isTraining: boolean;
  training: Training | null;
  problems: TrainingProblem[] | null;
  generateProblems: () => void;
  startTraining: () => void;
  stopTraining: () => void;
  refreshProblemStatus: () => void;
}) => {

  return (
    <div className="w-full flex flex-col items-center justify-center gap-4">
      <div className="w-full flex">
        <div className="w-full flex">
          {isTraining && training?.problems
            ? (
              <>
                {training.problems.map((problem) => (
                  <ProblemLink
                    key={`${problem.contestId}-${problem.index}`}
                    problem={problem}
                    isTraining={isTraining}
                    startTime={training?.startTime ?? null}
                  />
                ))}
                <button
                  onClick={refreshProblemStatus}
                >
                  🔄
                </button>
              </>
            ) : problems?.map((problem) => (
              <ProblemLink
                key={`${problem.contestId}-${problem.index}`}
                problem={problem}
                isTraining={isTraining}
                startTime={training?.startTime ?? null}
              />
            ))}
        </div>
      </div>

      <div className="w-full flex justify-center gap-4">
        {!isTraining ? (
          <>
            <button
              className="w-fit bg-black hover:bg-gray-800 text-white rounded-md p-2 transition-colors duration-300"
              onClick={generateProblems}
            >
              {problems && problems.length > 0
                ? "Regenerate Problems"
                : "Generate Problems"}
            </button>
            {problems && problems.length > 0 && (
              <button
                className="w-fit bg-black hover:bg-gray-800 text-white rounded-md p-2 transition-colors duration-300"
                onClick={startTraining}
              >
                Start Training
              </button>
            )}
          </>
        ) : (
          training && (
            <div className="flex flex-row gap-4 items-center">
              <CountDown
                startTime={training.startTime}
                endTime={training.endTime}
              />
              <button
                className="w-fit bg-black hover:bg-gray-800 text-white rounded-md p-2 transition-colors duration-300"
                onClick={stopTraining}
              >
                Stop Training
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Trainer;
