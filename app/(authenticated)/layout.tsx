// app/(authenticated)/layout.tsx

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { AppShell } from "../_components/layout/AppShell";
import { db } from "../_lib/prisma";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  // Verifica se o usuário já completou o onboarding/setup
  const user = await db.user.findUnique({
    where: { clerkId: userId },
    select: {
      id: true,
      onboardingCompleted: true,
    },
  });

  // Se ainda não completou o onboarding → redireciona
  if (!user?.onboardingCompleted) {
    redirect("/onboarding");
  }

  return <AppShell>{children}</AppShell>;
}
