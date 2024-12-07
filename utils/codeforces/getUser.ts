const getUser = async (codeforcesHandle: string) => {
  try {
    const res = await fetch(
      `https://codeforces.com/api/user.info?handles=${codeforcesHandle}`
    );
    const data = await res.json();
    if (data.status === "OK") {
      return data.result[0];
    }
    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export default getUser;