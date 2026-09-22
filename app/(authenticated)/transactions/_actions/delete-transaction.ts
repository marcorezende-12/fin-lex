"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { db } from "@/app/_lib/prisma";

type ActionResult = { success: true } | { success: false; error: string };

type BulkDeleteResult =
  | { success: true; count: number }
  | { success: false; error: string };

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

/**
 * Soft delete em massa. Verifica ownership via `userId` no `where` do
 * updateMany (transações de outros usuários no array são silenciosamente
 * ignoradas, evitando IDOR sem precisar de uma query extra por id).
 */
export async function bulkDeleteTransactions(
  transactionIds: string[],
): Promise<BulkDeleteResult> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { success: false, error: "Não autorizado" };

  if (transactionIds.length === 0) {
    return { success: false, error: "Nenhuma movimentação selecionada" };
  }

  const user = await db.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });
  if (!user) return { success: false, error: "Usuário não encontrado" };

  const result = await db.transaction.updateMany({
    where: {
      id: { in: transactionIds },
      userId: user.id,
      deletedAt: null,
    },
    data: { deletedAt: new Date() },
  });

  revalidatePath("/transactions");
  revalidatePath("/dashboard");

  return { success: true, count: result.count };
}
