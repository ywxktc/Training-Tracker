import { Level } from "@/types/Level";
import { TrainingProblem } from "@/types/TrainingProblem";

type Training = {
  level: Level;
  startTime: number;
  endTime: number;
  problems: TrainingProblem[];
  performance: number;
};

export type { Training };
