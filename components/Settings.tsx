"use client";

import { useState } from "react";
import useUser from "@/hooks/useUser";


const Settings = () => {
  const [codeforcesHandle, setCodeforcesHandle] = useState("");
  const { updateUser } = useUser();
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const onChangeCodeforcesHandle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCodeforcesHandle(e.target.value);
  };

  const onUpdateUser = async () => {
    if (!codeforcesHandle.trim()) {
      return;
    }

    setIsUpdating(true);
    const res = await updateUser(codeforcesHandle);
    if (!res.success) {
      setErrorMessage(res.error);
    }
    setIsUpdating(false);
  };

  return (
    <div className="flex flex-col items-start justify-center gap-2">
      <div className="flex items-center justify-center gap-4">
        <input
          type="text"
          className="border border-gray-300 rounded-md p-2 outline-none"
          value={codeforcesHandle}
          onChange={onChangeCodeforcesHandle}
          placeholder="Codeforces handle"
        />
        <button
          className={`bg-black hover:bg-gray-800 text-white rounded-md p-2 transition-colors duration-300 ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={onUpdateUser}
          disabled={isUpdating}
        >
          {isUpdating ? "Updating..." : "Update"}
        </button>
      </div>
      {errorMessage && <div className="text-red-500">{errorMessage}</div>}
    </div>
  );
};

export default Settings;
