import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { db } from "@/app/_lib/prisma";

const ChartsPage = async () => {
  const { userId } = await auth();
  if (!userId) return null;

  // 2. Busca o usuário no banco de dados local
  const user = await db.user.findUnique({
    where: { clerkId: userId },
  });

  // 3. Tá logado mas não tá no banco de dados? Vai para o onboarding terminar o cadastro
  if (!user) {
    redirect("/onboarding");
  }

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">
          Bem-vindo aos Gráficos, {user.name}
        </h1>
        <p className="text-muted-foreground mb-4">
          Aqui vai aparecer seus gráficos
        </p>
      </div>
    </div>
  );
};

export default ChartsPage;
