"use server";

import { auth } from "@clerk/nextjs/server";
import { TransactionStatus, TransactionType } from "@prisma/client";

import { db } from "@/app/_lib/prisma";

export interface DashboardSummary {
  expectedIncome: number;
  expectedExpense: number;
  expectedBalance: number;
  actualIncome: number;
  actualExpense: number;
  actualBalance: number;
}

type ActionResult =
  | { success: true; data: DashboardSummary }
  | { success: false; error: string };

export async function getDashboardSummary(
  startDate: Date,
  endDate: Date,
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

  // Garante que o endDate cobre o dia inteiro (até 23:59:59.999)
  const normalizedEnd = new Date(endDate);
  normalizedEnd.setHours(23, 59, 59, 999);

  // Uma única query groupBy para trazer os totais de cada combinação tipo+status
  const groups = await db.transaction.groupBy({
    by: ["type", "status"],
    where: {
      userId: user.id,
      deletedAt: null,
      dueDate: {
        gte: startDate,
        lte: normalizedEnd,
      },
    },
    _sum: {
      amountInCents: true,
    },
  });

  const getTotal = (type: TransactionType, status: TransactionStatus): number =>
    groups.find((g) => g.type === type && g.status === status)?._sum
      .amountInCents ?? 0;

  const expectedIncome = getTotal(
    TransactionType.INCOME,
    TransactionStatus.PENDING,
  );
  const expectedExpense = getTotal(
    TransactionType.EXPENSE,
    TransactionStatus.PENDING,
  );
  const actualIncome = getTotal(TransactionType.INCOME, TransactionStatus.PAID);
  const actualExpense = getTotal(
    TransactionType.EXPENSE,
    TransactionStatus.PAID,
  );

  return {
    success: true,
    data: {
      expectedIncome,
      expectedExpense,
      expectedBalance: expectedIncome - expectedExpense,
      actualIncome,
      actualExpense,
      actualBalance: actualIncome - actualExpense,
    },
  };
}
