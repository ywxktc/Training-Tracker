import level from "@/public/data/level.json";
import { Level } from "@/types/Level";

const getLevelByRating = (rating: number) => {
  const res = level.findLast((level: Level) => rating >= parseInt(level.Performance));
  return res ? res : level[0];
};

export default getLevelByRating;
