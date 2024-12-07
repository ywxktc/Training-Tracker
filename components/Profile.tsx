"use client";

import { useState } from "react";
import useUser from "@/hooks/useUser";
import Loader from "@/components/Loader";
import Image from "next/image";

const Profile = () => {
  const { user, updateUser, isLoading } = useUser();
  const [codeforcesHandle, setCodeforcesHandle] = useState("");

  const onUpdateCodeforcesHandle = () => {
    updateUser(codeforcesHandle);
  };

  const onChangeCodeforcesHandle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCodeforcesHandle(e.target.value);
  };

  if (isLoading) {
    return <Loader />;
  }

  if (!user) {
    return (
      <div className="w-full flex items-center justify-center gap-4">
        <input
          className="p-2 outline-none border-2 border-gray-300 rounded-md"
          type="text"
          value={codeforcesHandle}
          onChange={onChangeCodeforcesHandle}
          placeholder="Codeforces Handle"
        />
        <button
          className="p-2 bg-black hover:bg-gray-800 text-white rounded-md transition-colors duration-300"
          onClick={onUpdateCodeforcesHandle}
        >
          Update
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-4">
      <Image src={user.avatar} alt="avatar" width={100} height={100} />
      <div className="flex flex-col items-start justify-center">
        <div>
          <span className="font-bold">Username:</span> {user?.codeforcesHandle}
        </div>
        <div>
          <span className="font-bold">Rating:</span> {user?.rating}
        </div>
        <div>
          <span className="font-bold">Level:</span> {user?.level.level}
        </div>
      </div>
    </div>
  );
};

export default Profile;
