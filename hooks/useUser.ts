import { useState, useEffect } from "react";
import { User } from "@/types/User";
import { Level } from "@/types/Level";
import getUser from "@/utils/codeforces/getUser";
import getLevelByRating from "@/utils/getLevelByRating";

const useUser = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const localUser = localStorage.getItem("user");
    setUser(localUser ? JSON.parse(localUser) : null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
  }, [user]);

  const updateUser = async (codeforcesHandle: string) => {
    const res = await getUser(codeforcesHandle);
    if (!res.success) {
      return;
    }
    const profile = res.data;
    const newUser = {
      codeforcesHandle: profile.handle as string,
      avatar: profile.avatar as string,
      rating: profile.rating as number,
      level: getLevelByRating(profile.rating) as Level,
    };
    setUser(newUser);
  };

  return { user, updateUser, isLoading };
};

export default useUser;
