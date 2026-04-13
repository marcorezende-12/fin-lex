"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { db } from "@/app/_lib/prisma";

type ActionResult = { success: true } | { success: false; error: string };

/**
 * Soft delete de uma transação.
 * Verifica ownership antes de deletar para evitar IDOR.
 */
export async function deleteTransaction(
  transactionId: string,
): Promise<ActionResult> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { success: false, error: "Não autorizado" };

  const user = await db.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });
  if (!user) return { success: false, error: "Usuário não encontrado" };

  const transaction = await db.transaction.findFirst({
    where: { id: transactionId, userId: user.id, deletedAt: null },
    select: { id: true },
  });
  if (!transaction)
    return { success: false, error: "Transação não encontrada" };

  await db.transaction.update({
    where: { id: transaction.id },
    data: { deletedAt: new Date() },
  });

  revalidatePath("/transactions");
  revalidatePath("/dashboard");

  return { success: true };
}
