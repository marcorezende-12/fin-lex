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

  const resolvedName =
    name || `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim();

  // Verifica se o usuário já existe e já completou o onboarding
  const existingUser = await db.user.findUnique({
    where: { clerkId: clerkUserId },
    select: { onboardingCompleted: true },
  });

  if (existingUser?.onboardingCompleted) {
    redirect("/"); // Já completou o onboarding
  }

  // Usa upsert em vez de create: se já existir uma linha para este clerkId
  // (ex: registro criado por integração externa, ou uma tentativa anterior
  // que falhou após criar o usuário mas antes do redirect), evita erro de
  // unicidade e apenas atualiza os dados, marcando o onboarding como
  // concluído.
  await db.user.upsert({
    where: { clerkId: clerkUserId },
    create: {
      clerkId: clerkUserId,
      email,
      name: resolvedName,
      avatarUrl: clerkUser.imageUrl,
      role: "ADMIN", // Primeiro usuário sempre é ADMIN
      onboardingCompleted: true,
    },
    update: {
      name: resolvedName,
      avatarUrl: clerkUser.imageUrl,
      onboardingCompleted: true,
    },
  });

  // Redireciona para o Dashboard
  redirect("/");
}
