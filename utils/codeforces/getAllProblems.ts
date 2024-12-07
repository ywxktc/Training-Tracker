import { CodeforcesProblem } from "@/types/Codeforces";
import { SuccessResponse, ErrorResponse, Response } from "@/types/Response";

const getAllProblems = async (): Promise<Response<CodeforcesProblem[]>> => {
  try {
    const res = await fetch("https://codeforces.com/api/problemset.problems");
    const data = await res.json();
    if (data.status !== "OK") {
      return ErrorResponse("Failed to fetch problems");
    }
    return SuccessResponse(data.result.problems);
  } catch (error) {
    return ErrorResponse((error as Error).message);
  }
};

export default getAllProblems;