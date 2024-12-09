"use client";

import { User } from "@/types/User";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const Profile = ({ user, logout }: { user: User; logout: () => void }) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-6">
      <Avatar className="w-24 h-24 md:w-40 md:h-40">
        <AvatarImage src={user?.avatar || "/default-avatar.jpg"} alt="avatar" />
        <AvatarFallback>{user?.codeforcesHandle?.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col items-center md:items-start justify-center gap-2">
        <div className="text-lg">
          <span className="font-bold">Username:</span> {user?.codeforcesHandle}
        </div>
        <div>
          <span className="font-bold">Rating:</span> {user?.rating}
        </div>
        <div>
          <span className="font-bold">Level:</span> {user?.level.level}
        </div>
        <Button onClick={logout} variant="outline" className="mt-2">
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Profile;