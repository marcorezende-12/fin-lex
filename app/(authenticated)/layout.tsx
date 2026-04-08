// app/(dashboard)/layout.tsx

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { AppSidebar } from "../_components/layout/AppSidebar";
import { SidebarProvider } from "../_components/ui/sidebar";
import { db } from "../_lib/prisma";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  // Proteção: se não estiver logado → redireciona para login
  if (!userId) {
    redirect("/");
  }

  // Sincroniza o usuário com o banco (cria se não existir)
  // const syncedUser = await syncUser(userId);

  // if (!syncedUser) {
  //   console.error("Falha ao sincronizar usuário:", userId);
  //   // Opcional: redirect("/error") ou tratar de outra forma
  // }

  // Verifica se o usuário já completou o onboarding/setup
  const user = await db.user.findUnique({
    where: { clerkId: userId },
    select: { onboardingCompleted: true },
  });

  // Se ainda não completou o onboarding → redireciona
  if (!user?.onboardingCompleted) {
    redirect("/onboarding");
  }

  return (
    <SidebarProvider>
      {/* Sidebar fixa à esquerda */}
      <AppSidebar />

      {/* Área principal do conteúdo */}
      <div className="flex w-full flex-1 flex-col overflow-hidden">
        {/* Header superior */}

        {/* Conteúdo das páginas (Dashboard, Movimentações, etc) */}
        <main className="flex flex-1 flex-col overflow-auto p-6">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
