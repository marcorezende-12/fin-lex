"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { db } from "@/app/_lib/prisma";

import {
  TransactionSchema,
  transactionSchema,
} from "../_validations/transaction-schema";

type ActionResult = { success: true } | { success: false; error: string };

async function resolveUser(clerkId: string) {
  return db.user.findUnique({ where: { clerkId }, select: { id: true } });
}

/**
 * Atualiza os campos editáveis de uma transação (simples).
 * Não permite alterar parcelamento — parcelas têm fluxo próprio.
 */
export async function updateTransaction(
  transactionId: string,
  data: TransactionSchema,
): Promise<ActionResult> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { success: false, error: "Não autorizado" };

  const user = await resolveUser(clerkId);
  if (!user) return { success: false, error: "Usuário não encontrado" };

  // Validação server-side (não confia nos dados vindos do cliente)
  const parsed = transactionSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos",
    };
  }

  const {
    name,
    description,
    amount,
    type,
    categoryId,
    clientId,
    paymentMethod,
    date,
  } = parsed.data;

  const transaction = await db.transaction.findFirst({
    where: { id: transactionId, userId: user.id, deletedAt: null },
    select: { id: true },
  });
  if (!transaction)
    return { success: false, error: "Transação não encontrada" };

  // Valida FK de categoria (se fornecida)
  if (categoryId) {
    const category = await db.category.findFirst({
      where: { id: categoryId, userId: user.id, deletedAt: null },
      select: { id: true },
    });
    if (!category) {
      return {
        success: false,
        error: "Categoria inválida ou não pertence ao usuário",
      };
    }
  }

  // Valida FK de cliente (se fornecido)
  if (clientId) {
    const client = await db.client.findFirst({
      where: { id: clientId, userId: user.id, deletedAt: null },
      select: { id: true },
    });
    if (!client) {
      return {
        success: false,
        error: "Cliente inválido ou não pertence ao usuário",
      };
    }
  }

  await db.transaction.update({
    where: { id: transaction.id },
    data: {
      name,
      description,
      amountInCents: Math.round(amount * 100),
      type,
      categoryId: categoryId ?? null,
      clientId: clientId ?? null,
      paymentMethod,
      dueDate: date,
    },
  });

  revalidatePath("/transactions");
  revalidatePath("/dashboard");

  return { success: true };
}
