"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { db } from "@/app/_lib/prisma";
import { TransactionStatus } from "@/generated/prisma";

import { generatePendingOccurrences } from "../_lib/recurring";

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

/**
 * Reconfigura a data de término de um plano de recorrência — o mesmo dialog
 * usado ao criar ("Configurar Recorrência"), disponível também ao editar
 * qualquer ocorrência já gerada. Reativa o plano se ele estava encerrado
 * (active=false), já que reconfigurar implica retomar o controle dele.
 *
 * Se a nova data de término for mais cedo que antes, remove (soft delete)
 * as ocorrências pendentes já geradas que ficaram além dela. Se for mais
 * tarde (ou "sem término"), preenche o buffer até o novo horizonte.
 */
export async function updateRecurringPlanEndDate(
  planId: string,
  endDate: Date | null,
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
  });
  if (!plan) return { success: false, error: "Recorrência não encontrada" };

  if (endDate && endDate < plan.startDate) {
    return {
      success: false,
      error: "A data de término não pode ser antes do início da recorrência",
    };
  }

  const updatedPlan = await db.recurringPlan.update({
    where: { id: plan.id },
    data: { endDate, active: true },
  });

  if (endDate) {
    // Remove ocorrências pendentes já geradas que ficaram além do novo término
    await db.transaction.updateMany({
      where: {
        recurringPlanId: plan.id,
        userId: user.id,
        status: TransactionStatus.PENDING,
        dueDate: { gt: endDate },
        deletedAt: null,
      },
      data: { deletedAt: new Date() },
    });
  }

  // Preenche o buffer até o horizonte normal (cobre tanto extensão quanto
  // reativação de um plano que estava encerrado)
  await generatePendingOccurrences(updatedPlan);

  revalidatePath("/transactions");
  revalidatePath("/dashboard");

  return { success: true };
}
