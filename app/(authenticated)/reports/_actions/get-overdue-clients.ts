"use server";

import { auth } from "@clerk/nextjs/server";
import { differenceInCalendarDays } from "date-fns";

import { ActionResult } from "@/app/_lib/action-result";
import { db } from "@/app/_lib/prisma";
import { resolveUser } from "@/app/_lib/resolve-user";
import { TransactionStatus } from "@/generated/prisma";

export interface OverdueClientRow {
  /** null = movimentações atrasadas sem cliente vinculado (mesmo assim
   * entram no relatório — nada fica escondido só por faltar o vínculo). */
  clientId: string | null;
  clientName: string;
  totalOverdueInCents: number;
  transactionCount: number;
  /** Data de vencimento mais antiga em aberto — define o "atraso" do cliente. */
  oldestDueDate: Date;
  daysOverdue: number;
}

export interface OverdueReport {
  clients: OverdueClientRow[];
  totalOverdueInCents: number;
  generatedAt: Date;
}

/**
 * Clientes com pelo menos uma movimentação em atraso (PENDING com dueDate
 * no passado — OVERDUE não é persistido, é calculado aqui do mesmo jeito
 * que o resto do app). Agrupado por cliente, ordenado do que mais deve
 * pro que menos deve.
 */
export async function getOverdueClients(): Promise<
  ActionResult<OverdueReport>
> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { success: false, error: "Não autorizado" };

  const user = await resolveUser(clerkId);
  if (!user) return { success: false, error: "Usuário não encontrado" };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Sem o filtro clientId: { not: null } de propósito — o groupBy agrupa
  // as sem cliente vinculado num bucket clientId=null só delas, e isso
  // ainda entra no relatório em vez de ser descartado silenciosamente.
  const groups = await db.transaction.groupBy({
    by: ["clientId"],
    where: {
      userId: user.id,
      deletedAt: null,
      status: TransactionStatus.PENDING,
      dueDate: { lt: today },
    },
    _sum: { amountInCents: true },
    _count: { _all: true },
    _min: { dueDate: true },
  });

  if (groups.length === 0) {
    return {
      success: true,
      data: { clients: [], totalOverdueInCents: 0, generatedAt: new Date() },
    };
  }

  const clientIds = groups
    .map((g) => g.clientId)
    .filter((id): id is string => id !== null);
  const clients = await db.client.findMany({
    where: { id: { in: clientIds } },
    select: { id: true, name: true },
  });
  const nameById = new Map(clients.map((c) => [c.id, c.name]));

  const rows: OverdueClientRow[] = groups
    .map((g) => {
      const oldestDueDate = g._min.dueDate as Date;
      const clientName =
        g.clientId === null
          ? "Sem cliente vinculado"
          : (nameById.get(g.clientId) ?? "Cliente removido");
      return {
        clientId: g.clientId,
        clientName,
        totalOverdueInCents: g._sum.amountInCents ?? 0,
        transactionCount: g._count._all,
        oldestDueDate,
        daysOverdue: differenceInCalendarDays(today, oldestDueDate),
      };
    })
    .sort((a, b) => b.totalOverdueInCents - a.totalOverdueInCents);

  return {
    success: true,
    data: {
      clients: rows,
      totalOverdueInCents: rows.reduce(
        (acc, r) => acc + r.totalOverdueInCents,
        0,
      ),
      generatedAt: new Date(),
    },
  };
}
