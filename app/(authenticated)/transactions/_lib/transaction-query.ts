import {
  PaymentMethod,
  Prisma,
  TransactionStatus,
  TransactionType,
} from "@/generated/prisma";

// ==========================================
// TIPOS COMPARTILHADOS
// ==========================================
// Vive aqui (sem "use server") em vez de em get-transactions.ts porque um
// arquivo com "use server" trata toda exportação como Server Action — teria
// que ser função async, o que não faz sentido pra um helper síncrono como
// buildTransactionWhere. get-transactions.ts reexporta os tipos abaixo.

export interface TransactionFilters {
  search?: string;
  type?: TransactionType;
  status?: TransactionStatus;
  paymentMethod?: PaymentMethod;
  clientId?: string;
  from?: Date;
  to?: Date;
}

export interface TransactionPagination {
  /** 1-indexed. Padrão: 1. */
  page?: number;
  /** Padrão: 50. */
  pageSize?: number;
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

export const TRANSACTION_SELECT = {
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
} satisfies Prisma.TransactionSelect;

type RawTransaction = Prisma.TransactionGetPayload<{
  select: typeof TRANSACTION_SELECT;
}>;

/**
 * Calcula o status efetivo de exibição da transação.
 * Uma transação PENDING cujo dueDate já passou da data atual é considerada OVERDUE.
 * Transações PAID permanecem PAID independentemente da data.
 */
export function resolveEffectiveStatus(
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

export function toTransactionRow(t: RawTransaction): TransactionRow {
  return {
    ...t,
    effectiveStatus: resolveEffectiveStatus(t.status, t.dueDate),
    categoryName: t.category?.name ?? null,
    clientName: t.client?.name ?? null,
    recurringEndDate: t.recurringPlan?.endDate ?? null,
  };
}

/**
 * Monta o `where` compartilhado por toda consulta de transações (listagem
 * paginada, exportação CSV, extrato de cliente) — um só lugar pra manter a
 * lógica de filtro/OVERDUE consistente entre elas.
 */
export function buildTransactionWhere(
  userId: string,
  filters: TransactionFilters,
): Prisma.TransactionWhereInput {
  const { search, type, status, paymentMethod, clientId, from, to } = filters;

  // Garante que a data final cobre o dia inteiro
  const normalizedEnd = to ? new Date(to) : undefined;
  if (normalizedEnd) normalizedEnd.setHours(23, 59, 59, 999);

  // Quando o filtro é OVERDUE, buscamos transações PENDING com dueDate < hoje,
  // pois OVERDUE não existe como valor persistido — é calculado em runtime.
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const statusFilter: Prisma.TransactionWhereInput | undefined = (() => {
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

  return {
    userId,
    deletedAt: null,
    ...(type && { type }),
    ...(paymentMethod && { paymentMethod }),
    ...(clientId && { clientId }),
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
  };
}
