import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { db } from "../_lib/prisma";

const DashboardPage = async () => {
  const { userId } = await auth();

  // 1. Não tem login? Vai para a tela de login
  if (!userId) {
    redirect("/login");
  }

  // 2. Busca o usuário no banco de dados local
  const user = await db.user.findUnique({
    where: { clerkId: userId },
  });

  // 3. Tá logado mas não tá no banco de dados? Vai para o onboarding terminar o cadastro
  if (!user) {
    redirect("/onboarding");
  }

  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">
          Bem-vindo ao Dashboard, {user.name}
        </h1>
        <p className="text-muted-foreground mb-4">
          Aqui vai aparecer seu dashboard financeiro
        </p>
        <UserButton showName />
      </div>
    </div>
  );
};

export default DashboardPage;
