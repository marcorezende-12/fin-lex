// app/(dashboard)/layout.tsx

import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b px-8 py-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-green-600">FinLex</h1>
        </div>

        <div className="flex items-center gap-4">
          <UserButton showName afterSignOutUrl="/login" />
        </div>
      </header>

      {/* Conteúdo principal */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - vamos criar depois */}
        <aside className="bg-muted/40 w-72 border-r p-6">
          <nav className="space-y-2">
            <p className="text-muted-foreground mb-4 text-sm font-medium">
              MENU
            </p>
            {/* Links virão depois */}
          </nav>
        </aside>

        {/* Área de conteúdo */}
        <main className="flex-1 overflow-auto p-8">{children}</main>
      </div>
    </div>
  );
}
