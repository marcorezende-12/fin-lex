import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import Navbar from "../_components/navbar";

const TransactionsPage = async () => {
  const { userId } = await auth();
  if (!userId) {
    redirect("/login");
  }
  return (
    <>
      <Navbar />
      <h1>Transactions Page</h1>
    </>
  );
};

export default TransactionsPage;
