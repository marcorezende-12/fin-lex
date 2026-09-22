"use server";

import { auth } from "@clerk/nextjs/server";

import { db } from "@/app/_lib/prisma";
import {
  PaymentMethod,
  TransactionStatus,
  TransactionType,
} from "@/generated/prisma";

export interface TransactionFilters {
  search?: string;
  type?: TransactionType;
  status?: TransactionStatus;
  paymentMethod?: PaymentMethod;
  from?: Date;
  to?: Date;
}

export interface TransactionRow {
  id: string;
  name: string;
  description: string | null;
  amountInCents: number;
  type: TransactionType;
  status: TransactionStatus;
  /** Status calculado em runtime: PENDING vencido → OVERDUE */
  effectiveStatus: TransactionStatus;
  paymentMethod: PaymentMethod;
  installmentNumber: number | null;
  totalInstallments: number | null;
  dueDate: Date;
  paidAt: Date | null;
  categoryId: string | null;
  categoryName: string | null;
  clientId: string | null;
  clientName: string | null;
  recurringPlanId: string | null;
  /** Data de término configurada no plano (null = sem término). */
  recurringEndDate: Date | null;
}

type ActionResult =
  | { success: true; data: TransactionRow[] }
  | { success: false; error: string };

/**
 * Calcula o status efetivo de exibição da transação.
 * Uma transação PENDING cujo dueDate já passou da data atual é considerada OVERDUE.
 * Transações PAID permanecem PAID independentemente da data.
 */
function resolveEffectiveStatus(
  status: TransactionStatus,
  dueDate: Date,
): TransactionStatus {
  if (status === TransactionStatus.PAID) return TransactionStatus.PAID;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  if (due < today) return TransactionStatus.OVERDUE;

  return TransactionStatus.PENDING;
}

export async function getTransactions(
  filters: TransactionFilters = {},
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

  const { search, type, status, paymentMethod, from, to } = filters;

  // Garante que a data final cobre o dia inteiro
  const normalizedEnd = to ? new Date(to) : undefined;
  if (normalizedEnd) normalizedEnd.setHours(23, 59, 59, 999);

  // Quando o filtro é OVERDUE, buscamos transações PENDING com dueDate < hoje,
  // pois OVERDUE não existe como valor persistido — é calculado em runtime.
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const statusFilter = (() => {
    if (!status) return undefined;
    if (status === TransactionStatus.OVERDUE) {
      // OVERDUE = PENDING com vencimento passado
      return {
        status: TransactionStatus.PENDING,
        dueDate: { lt: today },
      };
    }
    return { status };
  })();

  const transactions = await db.transaction.findMany({
    where: {
      userId: user.id,
      deletedAt: null,
      ...(type && { type }),
      ...(paymentMethod && { paymentMethod }),
      // Aplica filtro de status / OVERDUE
      ...statusFilter,
      // Filtro de período (não sobrescreve dueDate do OVERDUE — conflito tratado abaixo)
      ...(!statusFilter?.dueDate && (from || normalizedEnd)
        ? {
            dueDate: {
              ...(from && { gte: from }),
              ...(normalizedEnd && { lte: normalizedEnd }),
            },
          }
        : {}),
      // Busca textual por nome ou descrição
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      name: true,
      description: true,
      amountInCents: true,
      type: true,
      status: true,
      paymentMethod: true,
      installmentNumber: true,
      totalInstallments: true,
      dueDate: true,
      paidAt: true,
      categoryId: true,
      category: { select: { name: true } },
      clientId: true,
      client: { select: { name: true } },
      recurringPlanId: true,
      recurringPlan: { select: { endDate: true } },
    },
    orderBy: { dueDate: "asc" },
  });

  return {
    success: true,
    data: transactions.map((t) => ({
      ...t,
      effectiveStatus: resolveEffectiveStatus(t.status, t.dueDate),
      categoryName: t.category?.name ?? null,
      clientName: t.client?.name ?? null,
      recurringEndDate: t.recurringPlan?.endDate ?? null,
    })),
  };
}
