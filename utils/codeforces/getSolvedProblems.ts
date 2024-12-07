import { User } from "@/types/User";
import { CodeforcesProblem, CodeforcesSubmission } from "@/types/Codeforces";
import { SuccessResponse, ErrorResponse, Response } from "@/types/Response";

const getSolvedProblems = async (
  user: User
): Promise<Response<CodeforcesProblem[]>> => {
  try {
    const res = await fetch(
      `https://codeforces.com/api/user.status?handle=${user.codeforcesHandle}`
    );
    const data = await res.json();
    if (data.status !== "OK") {
      return ErrorResponse("Failed to fetch solved problems");
    }
    const problems = data.result
      .filter((submission: CodeforcesSubmission) => submission.verdict === "OK")
      .map((submission: CodeforcesSubmission) => submission.problem);
    return SuccessResponse(problems);
  } catch (error) {
    return ErrorResponse((error as Error).message);
  }
};

export default getSolvedProblems;
