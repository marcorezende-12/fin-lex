"use server";

import { auth } from "@clerk/nextjs/server";
import { format } from "date-fns";

import { buildCsv } from "@/app/_lib/csv";
import { db } from "@/app/_lib/prisma";
import { TransactionStatus, TransactionType } from "@/generated/prisma";

import {
  buildTransactionWhere,
  type TransactionFilters,
} from "../_lib/transaction-query";
import { PAYMENT_METHOD_LABELS } from "../_types";

type ActionResult =
  | { success: true; csv: string; fileName: string }
  | { success: false; error: string };

const TYPE_LABELS: Record<TransactionType, string> = {
  INCOME: "Receita",
  EXPENSE: "Despesa",
};

const STATUS_LABELS: Record<TransactionStatus, string> = {
  PENDING: "Pendente",
  PAID: "Pago",
  OVERDUE: "Atrasado",
};

const CSV_HEADERS = [
  "Nome",
  "Descrição",
  "Tipo",
  "Status",
  "Método de Pagamento",
  "Categoria",
  "Cliente",
  "Vencimento",
  "Pagamento",
  "Parcela",
  "Valor (R$)",
];

/**
 * Exporta as transações que batem com os filtros atuais em CSV — mesmo
 * `where` da listagem paginada (buildTransactionWhere), mas sem paginar:
 * um relatório de exportação precisa de tudo que bate com o filtro, não
 * só a página que está na tela.
 */
export async function exportTransactionsCsv(
  filters: TransactionFilters = {},
): Promise<ActionResult> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { success: false, error: "Não autorizado" };

  const user = await db.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });
  if (!user) return { success: false, error: "Usuário não encontrado" };

  const where = buildTransactionWhere(user.id, filters);

  const transactions = await db.transaction.findMany({
    where,
    select: {
      name: true,
      description: true,
      type: true,
      status: true,
      paymentMethod: true,
      dueDate: true,
      paidAt: true,
      installmentNumber: true,
      totalInstallments: true,
      amountInCents: true,
      category: { select: { name: true } },
      client: { select: { name: true } },
      recurringPlanId: true,
    },
    orderBy: { dueDate: "asc" },
  });

  // Status efetivo (OVERDUE calculado em runtime) — mesma regra do resto do app
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const rows = transactions.map((t) => {
    const due = new Date(t.dueDate);
    due.setHours(0, 0, 0, 0);
    const effectiveStatus =
      t.status === TransactionStatus.PENDING && due < today
        ? TransactionStatus.OVERDUE
        : t.status;

    const parcela = t.recurringPlanId
      ? "Recorrente"
      : t.installmentNumber && t.totalInstallments
        ? `${t.installmentNumber}/${t.totalInstallments}`
        : "—";

    return [
      t.name,
      t.description ?? "",
      TYPE_LABELS[t.type],
      STATUS_LABELS[effectiveStatus],
      PAYMENT_METHOD_LABELS[t.paymentMethod],
      t.category?.name ?? "",
      t.client?.name ?? "",
      format(t.dueDate, "dd/MM/yyyy"),
      t.paidAt ? format(t.paidAt, "dd/MM/yyyy") : "",
      parcela,
      (t.amountInCents / 100).toFixed(2).replace(".", ","),
    ];
  });

  const csv = buildCsv(CSV_HEADERS, rows);
  const fileName = `movimentacoes-${format(new Date(), "yyyy-MM-dd")}.csv`;

  return { success: true, csv, fileName };
}
