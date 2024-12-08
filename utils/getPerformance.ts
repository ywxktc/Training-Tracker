import { Training } from "@/types/Training";

const getPerformance = (training: Training): number => {
  const level = +training.level.level;
  const startTime = training.startTime;

  // Extract ratings and penalties from problems
  const data = training.problems.map((problem) => {
    const penalty = problem.solvedTime
      ? (problem.solvedTime - startTime) / 60000
      : null;
    return { rating: problem.rating, penalty };
  });

  // Helper function to calculate the base range value
  function calculateRange(base: number, level: number): number {
    return Math.max(base, Math.min(base + 60, base + 2.5 * (level - 52)));
  }

  // Get the rating values (E-H)
  const [r1, r2, r3, r4] = data.map(d => d.rating);
  
  // Get the penalty values (I-L)
  const [t1, t2, t3, t4] = data.map(d => d.penalty);

  let result: number;

  // Following the same logic structure as the Excel formula
  if (t4 === null) {
    if (t3 === null) {
      if (t2 === null) {
        if (t1 === null) {
          // Base case: only first rating available
          result = r1 - 50;
        } else {
          // Case with T1 value
          const range = calculateRange(135, level);
          result = (t1 / range) * r1 + ((range - t1) / range) * r2;
        }
      } else {
        // Case with T2 value
        const range = calculateRange(135, level);
        result = (t2 / range) * r2 + ((range - t2) / range) * r3;
      }
    } else {
      // Case with T3 value
      const range = calculateRange(135, level);
      result = (t3 / range) * r3 + ((range - t3) / range) * r4;
    }
  } else {
    // Case with T4 value
    const range = calculateRange(120, level);
    result = (t4 / range) * r4 + 
            ((range - t4) / range) * (r4 + 400) + 
            ((level - 1) % 4) * 12.5;
  }

  return Math.round(result);
};

export default getPerformance;