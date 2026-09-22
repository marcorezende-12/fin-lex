"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { db } from "@/app/_lib/prisma";
import { TransactionStatus } from "@/generated/prisma";

type ActionResult = { success: true } | { success: false; error: string };

/**
 * Encerra um plano de recorrência: marca como inativo (a rotina mensal para
 * de gerar novas ocorrências) e remove (soft delete) as ocorrências já
 * geradas que ainda estão pendentes e vencem depois de hoje — o "buffer"
 * de meses futuros que não faz mais sentido cobrar. Ocorrências já pagas
 * ou vencidas até hoje permanecem intactas (histórico financeiro real).
 */
export async function cancelRecurringPlan(
  planId: string,
): Promise<ActionResult> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { success: false, error: "Não autorizado" };

  const user = await db.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });
  if (!user) return { success: false, error: "Usuário não encontrado" };

  const plan = await db.recurringPlan.findFirst({
    where: { id: planId, userId: user.id, deletedAt: null },
    select: { id: true },
  });
  if (!plan) return { success: false, error: "Recorrência não encontrada" };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await db.$transaction([
    db.recurringPlan.update({
      where: { id: plan.id },
      data: { active: false },
    }),
    db.transaction.updateMany({
      where: {
        recurringPlanId: plan.id,
        userId: user.id,
        status: TransactionStatus.PENDING,
        dueDate: { gt: today },
        deletedAt: null,
      },
      data: { deletedAt: new Date() },
    }),
  ]);

  revalidatePath("/transactions");
  revalidatePath("/dashboard");

  return { success: true };
}
