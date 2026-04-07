// app/(dashboard)/layout.tsx

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { AppSidebar } from "../_components/layout/AppSidebar";
import { SidebarProvider } from "../_components/ui/sidebar";
import { db } from "../_lib/prisma";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  // Proteção: se não estiver logado → redireciona para login
  if (!userId) {
    redirect("/login");
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
        <header className="flex h-16 shrink-0 items-center justify-between border-b px-8">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-green-600">FinLex</h1>
          </div>
        </header>

        {/* Conteúdo das páginas (Dashboard, Movimentações, etc) */}
        <main className="flex flex-1 flex-col overflow-auto p-6">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
