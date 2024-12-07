import Link from "next/link";
import { TrainingProblem } from "@/types/TrainingProblem";
import { Training } from "@/types/Training";
import CountDown from "@/components/CountDown";

const Trainer = ({
  isTraining,
  training,
  problems,
  generateProblems,
  startTraining,
  stopTraining,
}: {
  isTraining: boolean;
  training: Training | null;
  problems: TrainingProblem[] | null;
  generateProblems: () => void;
  startTraining: () => void;
  stopTraining: () => void;
}) => {

  return (
    <div className="w-full flex flex-col items-center justify-center gap-4">
      <div className="w-full flex">
        {isTraining && training?.problems ? (
          training.problems?.map((problem: TrainingProblem) => (
            <div
              key={`${problem.contestId}-${problem.index}`}
              className="w-1/4 flex items-center text-left"
            >
              <Link
                className="text-blue-500 hover:underline duration-300"
                href={problem.url}
                target="_blank"
              >
                {problem.solvedTime ? "✅" : ""}
                {problem.contestId}-{problem.index}
              </Link>
            </div>
          ))
        ) : (
          problems?.map((problem: TrainingProblem) => (
            <div
              key={`${problem.contestId}-${problem.index}`}
              className="w-1/4 flex items-center text-left"
            >
              <Link
                className="text-blue-500 hover:underline duration-300"
                href={problem.url}
                target="_blank"
              >
                {problem.contestId}-{problem.index}
              </Link>
            </div>
          ))
        )}
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
