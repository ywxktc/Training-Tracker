import { User } from "@/types/User";
import { CodeforcesProblem, CodeforcesSubmission } from "@/types/Codeforces";

const getSolvedProblems = async (user: User): Promise<CodeforcesProblem[]> => {
  try {
    const res = await fetch(
      `https://codeforces.com/api/user.status?handle=${user.codeforcesHandle}`
    );
    const data = await res.json();
    if (data.status !== "OK") {
      throw new Error("Failed to fetch solved problems");
    }
    const problems = data.result
      .filter((submission: CodeforcesSubmission) => submission.verdict === "OK")
      .map((submission: CodeforcesSubmission) => submission.problem);
    return problems;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export default getSolvedProblems;
