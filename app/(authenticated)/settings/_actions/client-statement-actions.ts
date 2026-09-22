"use server";

import { auth } from "@clerk/nextjs/server";

import { ActionResult } from "@/app/_lib/action-result";
import { db } from "@/app/_lib/prisma";
import { resolveUser } from "@/app/_lib/resolve-user";
import { TransactionStatus, TransactionType } from "@/generated/prisma";

export interface ClientSummary {
  /** Já recebido do cliente (receitas pagas) */
  paidIncome: number;
  /** Ainda a receber (receitas pendentes/atrasadas) */
  pendingIncome: number;
  /** Já pago em nome/por causa do cliente (despesas pagas) */
  paidExpense: number;
  /** A pagar (despesas pendentes/atrasadas) */
  pendingExpense: number;
  /** paidIncome - paidExpense */
  balance: number;
}

export interface ClientDetail {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  document: string | null;
  notes: string | null;
}

/** Busca os dados básicos de um cliente (cabeçalho do extrato). */
export async function getClientDetail(
  clientId: string,
): Promise<ActionResult<ClientDetail>> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { success: false, error: "Não autorizado" };

  const user = await resolveUser(clerkId);
  if (!user) return { success: false, error: "Usuário não encontrado" };

  const client = await db.client.findFirst({
    where: { id: clientId, userId: user.id, deletedAt: null },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      document: true,
      notes: true,
    },
  });
  if (!client) return { success: false, error: "Cliente não encontrado" };

  return { success: true, data: client };
}

/**
 * Totais financeiros de um cliente — mesmo padrão do getDashboardSummary,
 * mas sem recorte de período: é o histórico completo do cliente.
 */
export async function getClientSummary(
  clientId: string,
): Promise<ActionResult<ClientSummary>> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { success: false, error: "Não autorizado" };

  const user = await resolveUser(clerkId);
  if (!user) return { success: false, error: "Usuário não encontrado" };

  const groups = await db.transaction.groupBy({
    by: ["type", "status"],
    where: { userId: user.id, clientId, deletedAt: null },
    _sum: { amountInCents: true },
  });

  const getTotal = (type: TransactionType, status: TransactionStatus): number =>
    (groups.find((g) => g.type === type && g.status === status)?._sum
      .amountInCents ?? 0) / 100;

  // OVERDUE não existe como valor persistido no banco (é calculado em
  // runtime comparando dueDate com hoje) — uma transação atrasada ainda
  // está como PENDING aqui, então já está coberta abaixo.
  const pendingIncome = getTotal(
    TransactionType.INCOME,
    TransactionStatus.PENDING,
  );
  const pendingExpense = getTotal(
    TransactionType.EXPENSE,
    TransactionStatus.PENDING,
  );
  const paidIncome = getTotal(TransactionType.INCOME, TransactionStatus.PAID);
  const paidExpense = getTotal(TransactionType.EXPENSE, TransactionStatus.PAID);

  return {
    success: true,
    data: {
      paidIncome,
      pendingIncome,
      paidExpense,
      pendingExpense,
      balance: paidIncome - paidExpense,
    },
  };
}
