"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { db } from "@/app/_lib/prisma";
import { PaymentMethod } from "@/generated/prisma";

import {
  TransactionSchema,
  transactionSchema,
} from "../_validations/transaction-schema";

type ActionResult = { success: true } | { success: false; error: string };

/**
 * Normaliza os valores das parcelas para garantir que a soma bata exatamente
 * com o totalAmount, distribuindo qualquer diferença de arredondamento
 * na última parcela não fixada.
 *
 * Isso cobre o caso onde o usuário configurou parcelas com valores
 * diferentes entre si (ex: 1ª R$3.000, 2ª R$1.000, etc).
 */
function normalizeInstallmentValues(
  installmentsData: { number: number; date: Date; value: number }[],
  totalAmount: number,
): { number: number; date: Date; valueInCents: number }[] {
  const totalInCents = Math.round(totalAmount * 100);

  const normalized = installmentsData.map((inst) => ({
    number: inst.number,
    date: inst.date,
    valueInCents: Math.round(inst.value * 100),
  }));

  const currentSum = normalized.reduce((acc, i) => acc + i.valueInCents, 0);
  const diff = totalInCents - currentSum;

  // Se houver diferença de centavos por arredondamento, aplica na última parcela
  if (diff !== 0 && normalized.length > 0) {
    normalized[normalized.length - 1].valueInCents += diff;
  }

  return normalized;
}

/**
 * Valida se as parcelas são coerentes com o total declarado.
 * Aceita até 1 centavo de tolerância por arredondamento de cada parcela.
 */
function validateInstallmentSum(
  installmentsData: { number: number; date: Date; value: number }[],
  totalAmount: number,
  installmentsCount: number,
): string | null {
  if (installmentsData.length !== installmentsCount) {
    return `Número de parcelas inválido: esperado ${installmentsCount}, recebido ${installmentsData.length}`;
  }

  const totalInCents = Math.round(totalAmount * 100);
  const sumInCents = installmentsData.reduce(
    (acc, i) => acc + Math.round(i.value * 100),
    0,
  );

  // Tolerância de 1 centavo por parcela para cobrir erros de arredondamento
  const tolerance = installmentsData.length;

  if (Math.abs(sumInCents - totalInCents) > tolerance) {
    return `A soma das parcelas (${(sumInCents / 100).toFixed(2)}) não corresponde ao valor total (${(totalInCents / 100).toFixed(2)})`;
  }

  for (const inst of installmentsData) {
    if (inst.value < 0) {
      return `A parcela ${inst.number} possui valor negativo`;
    }
  }

  return null;
}

export async function createTransaction(
  data: TransactionSchema,
): Promise<ActionResult> {
  // 1. Autentica o usuário via Clerk
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return { success: false, error: "Não autorizado" };
  }

  // 2. Revalida os dados no servidor com Zod — nunca confie apenas no client
  const parsed = transactionSchema.safeParse(data);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Dados inválidos";
    return { success: false, error: firstError };
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
    installments,
    installmentsData,
  } = parsed.data;

  // 3. Busca o usuário interno pelo clerkId
  const user = await db.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });

  if (!user) {
    return { success: false, error: "Usuário não encontrado" };
  }

  // 4. Valida categoryId e clientId contra o banco para evitar FK inválida
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

  const amountInCents = Math.round(amount * 100);

  try {
    if (
      paymentMethod === PaymentMethod.INSTALLMENT &&
      installmentsData &&
      installments
    ) {
      // 5a. Valida as parcelas recebidas antes de persistir
      const installmentError = validateInstallmentSum(
        installmentsData,
        amount,
        installments,
      );

      if (installmentError) {
        return { success: false, error: installmentError };
      }

      // Normaliza os valores garantindo que a soma bate exatamente com o total,
      // respeitando os valores individuais configurados pelo usuário (parcelas desiguais)
      const normalizedInstallments = normalizeInstallmentValues(
        installmentsData,
        amount,
      );

      // 5b. Cria o plano + parcelas em uma única transação de banco (atomicidade)
      await db.$transaction(async (tx) => {
        const plan = await tx.installmentPlan.create({
          data: {
            userId: user.id,
            name,
            totalAmount: amountInCents,
          },
        });

        await tx.transaction.createMany({
          data: normalizedInstallments.map((installment) => ({
            userId: user.id,
            clientId: clientId ?? null,
            categoryId: categoryId ?? null,
            installmentPlanId: plan.id,
            name,
            description: description ?? null,
            amountInCents: installment.valueInCents,
            type,
            paymentMethod,
            installmentNumber: installment.number,
            totalInstallments: installments,
            dueDate: installment.date,
          })),
        });
      });
    } else {
      // 5c. Fluxo simples — uma única transação
      await db.transaction.create({
        data: {
          userId: user.id,
          clientId: clientId ?? null,
          categoryId: categoryId ?? null,
          name,
          description: description ?? null,
          amountInCents,
          type,
          paymentMethod,
          dueDate: date,
        },
      });
    }

    revalidatePath("/transactions");

    return { success: true };
  } catch (err) {
    console.error("[createTransaction] Erro ao salvar transação:", err);
    return { success: false, error: "Erro interno ao salvar a transação" };
  }
}
