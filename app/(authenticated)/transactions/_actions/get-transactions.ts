"use server";

import { auth } from "@clerk/nextjs/server";

import { db } from "@/app/_lib/prisma";

import {
  buildTransactionWhere,
  toTransactionRow,
  TRANSACTION_SELECT,
  type TransactionFilters,
  type TransactionPagination,
  type TransactionRow,
} from "../_lib/transaction-query";

export type { TransactionFilters, TransactionPagination, TransactionRow };

type ActionResult =
  | {
      success: true;
      data: TransactionRow[];
      totalCount: number;
      page: number;
      pageSize: number;
      totalPages: number;
    }
  | { success: false; error: string };

export async function getTransactions(
  filters: TransactionFilters = {},
  pagination: TransactionPagination = {},
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

  const where = buildTransactionWhere(user.id, filters);
  const page = Math.max(1, pagination.page ?? 1);
  const pageSize = Math.max(1, pagination.pageSize ?? 50);

  // count + findMany em paralelo — uma única viagem lógica ao banco
  const [totalCount, transactions] = await Promise.all([
    db.transaction.count({ where }),
    db.transaction.findMany({
      where,
      select: TRANSACTION_SELECT,
      orderBy: { dueDate: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    success: true,
    data: transactions.map(toTransactionRow),
    totalCount,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
  };
}
