"use client";

import Image from "next/image";
import { User } from "@/types/User";

const Profile = ({
  user,
  logout,
}: {
  user: User;
  logout: () => void;
}) => {
  return (
    <div className="flex items-center justify-center gap-4">
      <Image
        className="w-40"
        src={user?.avatar || "default-avatar.jpg"}
        alt="avatar"
        width={150}
        height={150}
      />
      <div className="flex flex-col items-start justify-center gap-2">
        <div>
          <span className="font-bold">Username:</span>{" "}
          {user?.codeforcesHandle}
        </div>
        <div>
          <span className="font-bold">Rating:</span> {user?.rating}
        </div>
        <div>
          <span className="font-bold">Level:</span> {user?.level.level}
        </div>
        <button
          onClick={logout}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;
