"use client";

import Profile from "@/components/Profile";
import Settings from "@/components/Settings";
import Loader from "@/components/Loader";
import Error from "@/components/Error";
import useUser from "@/hooks/useUser";

const Home = () => {
  const {
    user,
    isLoading,
    error,
    logout,
  } = useUser();

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <Error />;
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen font-mono">
      {user ? <Profile user={user} logout={logout} /> : <Settings />}
    </div>
  );
};

export default Home;