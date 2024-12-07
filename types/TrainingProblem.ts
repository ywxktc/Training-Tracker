import { CodeforcesProblem } from "./Codeforces";

type TrainingProblem = CodeforcesProblem & {
  url: string;
  solvedTime: number | null;
};

export type { TrainingProblem };
