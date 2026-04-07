// app/actions/onboarding.ts
"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { db } from "../_lib/prisma";

export async function completeOnboarding(formData: FormData) {
  "use server";

  const { userId: clerkUserId } = await auth();
  const clerkUser = await currentUser();

  if (!clerkUserId || !clerkUser) {
    throw new Error("Não autorizado");
  }

  const name = (formData.get("name") as string)?.trim() || "";

  const email = clerkUser.emailAddresses[0]?.emailAddress;
  if (!email) {
    throw new Error("Email não encontrado");
  }

  // Verifica se o usuário já existe e já completou o onboarding
  const existingUser = await db.user.findUnique({
    where: { clerkId: clerkUserId },
    select: { onboardingCompleted: true },
  });

  if (existingUser?.onboardingCompleted) {
    redirect("/"); // Já completou o onboarding
  }

  // Cria o usuário e marca o onboarding como concluído
  await db.user.create({
    data: {
      clerkId: clerkUserId,
      email: email,
      name:
        name ||
        `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim(),
      avatarUrl: clerkUser.imageUrl,
      role: "ADMIN", // Primeiro usuário sempre é ADMIN
      onboardingCompleted: true, // ← Campo atualizado
    },
  });

  // Redireciona para o Dashboard
  redirect("/");
}
