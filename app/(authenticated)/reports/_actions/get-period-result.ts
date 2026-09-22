"use server";

import { auth } from "@clerk/nextjs/server";
import {
  endOfMonth,
  endOfYear,
  format,
  startOfMonth,
  startOfYear,
} from "date-fns";
import { ptBR } from "date-fns/locale";

import { ActionResult } from "@/app/_lib/action-result";
import { db } from "@/app/_lib/prisma";
import { resolveUser } from "@/app/_lib/resolve-user";
import { TransactionStatus, TransactionType } from "@/generated/prisma";

export type PeriodType = "month" | "year";

export interface PeriodResult {
  periodLabel: string;
  startDate: Date;
  endDate: Date;
  /** Valores realizados (status PAID) — o que de fato entrou/saiu do caixa. */
  actualIncome: number;
  actualExpense: number;
  profit: number;
  /** Valores previstos (status PENDING) — ainda não realizados. */
  expectedIncome: number;
  expectedExpense: number;
  expectedProfit: number;
  generatedAt: Date;
}

/**
 * Resultado financeiro (entrou / saiu / lucro) de um mês ou ano específico
 * — mesma lógica de agregação do dashboard (getDashboardSummary), mas com
 * período escolhido livremente em vez de fixo no mês atual.
 *
 * @param month 1-indexado (1 = janeiro). Ignorado quando period="year".
 */
export async function getPeriodResult(
  period: PeriodType,
  year: number,
  month: number,
): Promise<ActionResult<PeriodResult>> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { success: false, error: "Não autorizado" };

  const user = await resolveUser(clerkId);
  if (!user) return { success: false, error: "Usuário não encontrado" };

  const reference =
    period === "year" ? new Date(year, 0, 1) : new Date(year, month - 1, 1);

  const startDate =
    period === "year" ? startOfYear(reference) : startOfMonth(reference);
  const endDate =
    period === "year" ? endOfYear(reference) : endOfMonth(reference);
  endDate.setHours(23, 59, 59, 999);

  const groups = await db.transaction.groupBy({
    by: ["type", "status"],
    where: {
      userId: user.id,
      deletedAt: null,
      dueDate: { gte: startDate, lte: endDate },
    },
    _sum: { amountInCents: true },
  });

  const getTotal = (type: TransactionType, status: TransactionStatus): number =>
    groups.find((g) => g.type === type && g.status === status)?._sum
      .amountInCents ?? 0;

  const actualIncome = getTotal(TransactionType.INCOME, TransactionStatus.PAID);
  const actualExpense = getTotal(
    TransactionType.EXPENSE,
    TransactionStatus.PAID,
  );
  const expectedIncome = getTotal(
    TransactionType.INCOME,
    TransactionStatus.PENDING,
  );
  const expectedExpense = getTotal(
    TransactionType.EXPENSE,
    TransactionStatus.PENDING,
  );

  const periodLabel =
    period === "year"
      ? format(reference, "yyyy")
      : format(reference, "MMMM 'de' yyyy", { locale: ptBR });

  return {
    success: true,
    data: {
      periodLabel,
      startDate,
      endDate,
      actualIncome,
      actualExpense,
      profit: actualIncome - actualExpense,
      expectedIncome,
      expectedExpense,
      expectedProfit: expectedIncome - expectedExpense,
      generatedAt: new Date(),
    },
  };
}
