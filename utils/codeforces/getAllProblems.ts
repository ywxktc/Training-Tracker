import { CodeforcesProblem } from "@/types/Codeforces";

const getAllProblems = async (): Promise<CodeforcesProblem[]> => {
  try {
    const res = await fetch("https://codeforces.com/api/problemset.problems");
    const data = await res.json();
    if (data.status !== "OK") {
      throw new Error("Failed to fetch problems");
    }
    return data.result.problems;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export default getAllProblems;