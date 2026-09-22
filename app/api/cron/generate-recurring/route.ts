import { NextRequest, NextResponse } from "next/server";

import { db } from "@/app/_lib/prisma";
import { generatePendingOccurrences } from "@/app/(authenticated)/transactions/_lib/recurring";

export const dynamic = "force-dynamic";

/**
 * Rotina mensal (ver vercel.json → crons) que mantém as recorrências
 * ativas com ocorrências geradas dentro do horizonte definido em
 * generatePendingOccurrences. É o que faz "sem término" funcionar de
 * verdade — sem isso, um plano sem data de fim pararia de gerar cobranças
 * assim que o buffer inicial acabasse.
 *
 * Protegida por CRON_SECRET: a Vercel injeta automaticamente o header
 * `Authorization: Bearer $CRON_SECRET` ao disparar o cron (ver
 * https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs).
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const plans = await db.recurringPlan.findMany({
    where: { active: true, deletedAt: null },
  });

  let totalGenerated = 0;
  const errors: { planId: string; message: string }[] = [];

  for (const plan of plans) {
    try {
      totalGenerated += await generatePendingOccurrences(plan);
    } catch (err) {
      console.error(
        `[cron/generate-recurring] Erro ao gerar ocorrências do plano ${plan.id}:`,
        err,
      );
      errors.push({
        planId: plan.id,
        message: err instanceof Error ? err.message : "Erro desconhecido",
      });
    }
  }

  return NextResponse.json({
    plansProcessed: plans.length,
    occurrencesGenerated: totalGenerated,
    errors,
  });
}
