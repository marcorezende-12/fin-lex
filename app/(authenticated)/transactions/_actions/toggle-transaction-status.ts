"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { db } from "@/app/_lib/prisma";
import { TransactionStatus } from "@/generated/prisma";

type ActionResult = { success: true } | { success: false; error: string };

/**
 * Alterna o status de uma transação entre PAID e PENDING.
 * Se estiver PENDING/OVERDUE → marca como PAID usando a data informada (ou now).
 * Ao confirmar, o valor lançado (muitas vezes uma estimativa, ex. conta de luz)
 * pode ser ajustado para o valor efetivamente pago via `paidAmountInCents`.
 * Se estiver PAID → reverte para PENDING (limpa paidAt e mantém o valor).
 */
export async function toggleTransactionStatus(
  transactionId: string,
  paidAt?: Date,
  paidAmountInCents?: number,
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

  if (paidAmountInCents !== undefined && paidAmountInCents <= 0) {
    return { success: false, error: "O valor deve ser positivo" };
  }

  const isPaid = transaction.status === TransactionStatus.PAID;

  await db.transaction.update({
    where: { id: transaction.id },
    data: {
      status: isPaid ? TransactionStatus.PENDING : TransactionStatus.PAID,
      paidAt: isPaid ? null : (paidAt ?? new Date()),
      ...(!isPaid && paidAmountInCents !== undefined
        ? { amountInCents: paidAmountInCents }
        : {}),
    },
  });

  revalidatePath("/transactions");
  revalidatePath("/dashboard");

  return { success: true };
}
