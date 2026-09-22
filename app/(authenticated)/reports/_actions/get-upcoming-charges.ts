"use server";

import { auth } from "@clerk/nextjs/server";
import { addDays, differenceInCalendarDays } from "date-fns";

import { ActionResult } from "@/app/_lib/action-result";
import { db } from "@/app/_lib/prisma";
import { resolveUser } from "@/app/_lib/resolve-user";
import { TransactionStatus, TransactionType } from "@/generated/prisma";

export interface UpcomingChargeRow {
  transactionId: string;
  clientId: string | null;
  clientName: string | null;
  name: string;
  dueDate: Date;
  daysUntilDue: number;
  amountInCents: number;
}

export interface UpcomingReport {
  charges: UpcomingChargeRow[];
  totalInCents: number;
  windowDays: number;
  generatedAt: Date;
}

/**
 * Receitas pendentes com vencimento nos próximos `windowDays` dias — "o que
 * vou cobrar/receber em breve". Só receitas (type INCOME): "cobrança" aqui
 * significa contas a receber, não a pagar.
 */
export async function getUpcomingCharges(
  windowDays: number = 30,
): Promise<ActionResult<UpcomingReport>> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { success: false, error: "Não autorizado" };

  const user = await resolveUser(clerkId);
  if (!user) return { success: false, error: "Usuário não encontrado" };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const windowEnd = addDays(today, windowDays);
  windowEnd.setHours(23, 59, 59, 999);

  const transactions = await db.transaction.findMany({
    where: {
      userId: user.id,
      deletedAt: null,
      type: TransactionType.INCOME,
      status: TransactionStatus.PENDING,
      dueDate: { gte: today, lte: windowEnd },
    },
    select: {
      id: true,
      name: true,
      dueDate: true,
      amountInCents: true,
      clientId: true,
      client: { select: { name: true } },
    },
    orderBy: { dueDate: "asc" },
  });

  const charges: UpcomingChargeRow[] = transactions.map((t) => ({
    transactionId: t.id,
    clientId: t.clientId,
    clientName: t.client?.name ?? null,
    name: t.name,
    dueDate: t.dueDate,
    daysUntilDue: differenceInCalendarDays(t.dueDate, today),
    amountInCents: t.amountInCents,
  }));

  return {
    success: true,
    data: {
      charges,
      totalInCents: charges.reduce((acc, c) => acc + c.amountInCents, 0),
      windowDays,
      generatedAt: new Date(),
    },
  };
}
