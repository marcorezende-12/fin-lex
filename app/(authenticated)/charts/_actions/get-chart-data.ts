"use server";

import { auth } from "@clerk/nextjs/server";
import { TransactionStatus, TransactionType } from "@prisma/client";
import {
  addMonths,
  endOfMonth,
  format,
  startOfMonth,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";

import { db } from "@/app/_lib/prisma";

export interface ChartDataPoint {
  /** Rótulo do mês para exibição no eixo X, ex: "Jan" */
  month: string;
  /** Ano + mês no formato yyyy-MM para ordenação */
  yearMonth: string;
  /** Total de receitas PAID em reais (já convertido de centavos) */
  income: number;
  /** Total de despesas PAID em reais (já convertido de centavos) */
  expense: number;
  /** Total de receitas PENDING/OVERDUE em reais */
  expectedIncome: number;
  /** Total de despesas PENDING/OVERDUE em reais */
  expectedExpense: number;
}

type ActionResult =
  | { success: true; data: ChartDataPoint[] }
  | { success: false; error: string };

/**
 * Retorna dados mensais agregados para os gráficos.
 * O eixo X é sempre centrado no mês de referência,
 * exibindo: 2 meses anteriores + mês atual + 2 meses posteriores (5 pontos).
 *
 * @param centerMonth Mês de referência (padrão: mês atual)
 */
export async function getChartData(centerMonth?: Date): Promise<ActionResult> {
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

  const center = centerMonth ?? new Date();

  // Gera a janela de 5 meses: -2 até +2 em relação ao centro
  const months = [-2, -1, 0, 1, 2].map((offset) => {
    const date =
      offset < 0
        ? subMonths(center, Math.abs(offset))
        : addMonths(center, offset);
    return {
      label: format(date, "MMM", { locale: ptBR }),
      yearMonth: format(date, "yyyy-MM"),
      start: startOfMonth(date),
      end: endOfMonth(date),
    };
  });

  const rangeStart = months[0].start;
  const rangeEnd = months[months.length - 1].end;

  // Uma única query para toda a janela de 5 meses
  const transactions = await db.transaction.findMany({
    where: {
      userId: user.id,
      deletedAt: null,
      dueDate: { gte: rangeStart, lte: rangeEnd },
    },
    select: {
      amountInCents: true,
      type: true,
      status: true,
      dueDate: true,
    },
  });

  // Agrega os valores por mês
  const dataMap = new Map<string, ChartDataPoint>(
    months.map(({ label, yearMonth }) => [
      yearMonth,
      {
        month: label,
        yearMonth,
        income: 0,
        expense: 0,
        expectedIncome: 0,
        expectedExpense: 0,
      },
    ]),
  );

  for (const t of transactions) {
    const key = format(new Date(t.dueDate), "yyyy-MM");
    const entry = dataMap.get(key);
    if (!entry) continue;

    const valueInReais = t.amountInCents / 100;
    const isPaid = t.status === TransactionStatus.PAID;

    if (t.type === TransactionType.INCOME) {
      if (isPaid) entry.income += valueInReais;
      else entry.expectedIncome += valueInReais;
    } else {
      if (isPaid) entry.expense += valueInReais;
      else entry.expectedExpense += valueInReais;
    }
  }

  return {
    success: true,
    data: Array.from(dataMap.values()),
  };
}
