import Link from "next/link";
import { Training } from "@/types/Training";
import { TrainingProblem } from "@/types/TrainingProblem";

const Problem = ({ problem, startTime }: { problem: TrainingProblem; startTime: number }) => {
  const getSolvedStatus = () => {
    if (problem.solvedTime) {
      const solvedMinutes = Math.floor((problem.solvedTime - startTime) / 60000);
      return `✅ ${solvedMinutes}m `;
    }
    return "❌ ";
  };
  return (
    <Link
      className="text-blue-500 hover:underline duration-300"
      href={problem.url}
      target="_blank"
    >
      {getSolvedStatus()}
      {problem.contestId}-{problem.index}
    </Link>
  );
};

const History = ({
  history,
  deleteTraining,
}: {
  history: Training[];
  deleteTraining: (training: Training) => void;
}) => {

  const onDelete = (training: Training) => {
    if (confirm("Are you sure you want to delete this record?")) {
      deleteTraining(training);
    }
  };

  return (
    <div className="w-full flex flex-col gap-2">
      {/* Header */}
      <div className="w-full flex flex-row items-center py-3 border-b border-gray-200 font-bold">
        <div className="w-[15%] px-2">Date</div>
        <div className="w-[5%] px-2">Level</div>
        <div className="w-[65%] flex justify-around">
          {history[0].problems.map((p, index) => (
            <div key={index}>P{index + 1}</div>
          ))}
        </div>
        <div className="w-[10%] px-2">Performance</div>
        <div className="w-[5%]"></div>
      </div>

      {/* Rows */}
      {history.map((training) => (
        <div 
          key={training.startTime} 
          className="w-full flex flex-row items-center py-2 hover:bg-gray-50 border-b border-gray-100"
        >
          <div className="w-[15%] px-2">{new Date(training.startTime).toLocaleDateString()}</div>
          <div className="w-[5%] px-2">{training.level.level}</div>
          <div className="w-[65%] flex justify-around">
            {training.problems.map((p) => (
              <Problem key={p.contestId} problem={p} startTime={training.startTime} />
            ))}
          </div>
          <div className="w-[10%] px-2">{training.performance}</div>
          <button className="w-[5%]" onClick={() => onDelete(training)}>
            🗑️
          </button>
        </div>
      ))}
    </div>
  );
};

export default History;
