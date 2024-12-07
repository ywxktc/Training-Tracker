"use client";

import useUser from "@/hooks/useUser";
import Trainer from "@/components/Trainer";

const Training = () => {
  const { user } = useUser();

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="w-full flex gap-4">
        <div className="w-full flex flex-row justify-between">
          <div>
            <span className="font-bold">Level:</span> {user?.level.level}
          </div>
          <div>
            <span className="font-bold">Performance:</span> {user?.level.Performance}
          </div>
          <div>
            <span className="font-bold">Time:</span> {user?.level.time}
          </div>
        </div>
      </div>
      <div className="w-full flex flex-row">
        <div className="w-1/4 text-left">
          <span className="font-bold">P1:</span> {user?.level.P1}
        </div>
        <div className="w-1/4 text-left">
          <span className="font-bold">P2:</span> {user?.level.P2}
        </div>
        <div className="w-1/4 text-left">
          <span className="font-bold">P3:</span> {user?.level.P3}
        </div>
        <div className="w-1/4 text-left">
          <span className="font-bold">P4:</span> {user?.level.P4}
        </div>
      </div>
      <Trainer />
    </div>
  );
};

export default Training;
