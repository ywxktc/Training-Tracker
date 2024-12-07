import { Level } from "./Level";
import { TrainingProblem } from "./TrainingProblem";

type Training = {
  level: Level;
  startTime: number;
  endTime: number;
  problems: TrainingProblem[];
};

export type { Training };
