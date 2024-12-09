import { Training } from "@/types/Training";
import { TrainingProblem } from "@/types/TrainingProblem";

function getPerformance(training: Training) {
  const D = training.level.id;
  
  // Extract ratings (E, F, G, H)
  const E = training.problems[0].rating;
  const F = training.problems[1].rating;
  const G = training.problems[2].rating;
  const H = training.problems[3].rating;

  // Extract solved times (I, J, K, L) adjusted by startTime
  function adjustedTime(p: TrainingProblem) {
    return p.solvedTime !== null ? (p.solvedTime - training.startTime) : null;
  }

  const I = adjustedTime(training.problems[0]);
  const J = adjustedTime(training.problems[1]);
  const K = adjustedTime(training.problems[2]);
  const L = adjustedTime(training.problems[3]);

  // Define the scale functions
  function scale1(D: number) {
    // scale1 = MAX(135, MIN(195, 135 + 2.5*(D-52)))
    const val = 135 + 2.5 * (D - 52);
    return Math.max(135, Math.min(195, val));
  }

  function scale2(D: number) {
    // scale2 = MAX(120, MIN(180, 120 + 2.5*(D-52)))
    const val = 120 + 2.5 * (D - 52);
    return Math.max(120, Math.min(180, val));
  }

  // Compute performance based on the provided logic
  let performance;
  if (L === null) {
    // L blank
    if (K === null) {
      // K blank
      if (J === null) {
        // J blank
        if (I === null) {
          // I blank
          // E20 - 50
          performance = E - 50;
        } else {
          // I not blank
          // (I/scale1)*E + ((scale1 - I)/scale1)*F
          const sc1 = scale1(D);
          performance = (I / sc1) * E + ((sc1 - I) / sc1) * F;
        }
      } else {
        // J not blank
        // (J/scale1)*F + ((scale1 - J)/scale1)*G
        const sc1 = scale1(D);
        performance = (J / sc1) * F + ((sc1 - J) / sc1) * G;
      }
    } else {
      // K not blank
      // (K/scale1)*G + ((scale1 - K)/scale1)*H
      const sc1 = scale1(D);
      performance = (K / sc1) * G + ((sc1 - K) / sc1) * H;
    }
  } else {
    // L not blank
    // (L/scale2)*H + ((scale2 - L)/scale2)*(H + 400) + MOD(D-1,4)*12.5
    const sc2 = scale2(D);
    const modVal = ((D - 1) % 4 + 4) % 4; // ensure positive mod
    performance = (L / sc2) * H 
                + ((sc2 - L) / sc2) * (H + 400) 
                + modVal * 12.5;
  }

  // Round the result
  performance = Math.round(performance);

  return performance;
}

export { getPerformance };