"use server";

import { auth } from "@clerk/nextjs/server";
import { TransactionStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { db } from "@/app/_lib/prisma";

type ActionResult = { success: true } | { success: false; error: string };

/**
 * Alterna o status de uma transação entre PAID e PENDING.
 * Se estiver PENDING/OVERDUE → marca como PAID (define paidAt).
 * Se estiver PAID → reverte para PENDING (limpa paidAt).
 */
export async function toggleTransactionStatus(
  transactionId: string,
): Promise<ActionResult> {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return { success: false, error: "Não autorizado" };
  }

  const user = await db.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });

  if (!user) {
    return { success: false, error: "Usuário não encontrado" };
  }

  // Busca a transação garantindo que pertence ao usuário autenticado
  const transaction = await db.transaction.findFirst({
    where: {
      id: transactionId,
      userId: user.id,
      deletedAt: null,
    },
    select: { id: true, status: true },
  });

  if (!transaction) {
    return { success: false, error: "Transação não encontrada" };
  }

  const isPaid = transaction.status === TransactionStatus.PAID;

  await db.transaction.update({
    where: { id: transaction.id },
    data: {
      status: isPaid ? TransactionStatus.PENDING : TransactionStatus.PAID,
      paidAt: isPaid ? null : new Date(),
    },
  });

  revalidatePath("/transactions");
  revalidatePath("/dashboard");

  return { success: true };
}
