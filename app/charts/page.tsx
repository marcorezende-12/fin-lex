import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import Navbar from "../_components/navbar";

const ChartsPage = async () => {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/login");
  }
  return (
    <>
      <Navbar />
      <h1>ChartsPage</h1>
    </>
  );
};

export default ChartsPage;
