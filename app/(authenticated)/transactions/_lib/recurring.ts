import { addMonths, lastDayOfMonth, setDate, startOfMonth } from "date-fns";

import { db } from "@/app/_lib/prisma";
import { RecurringPlan } from "@/generated/prisma";

/**
 * Quantos meses à frente de hoje o horizonte de geração deve cobrir.
 *
 * A cada execução (criação do plano ou rotina mensal), garantimos que as
 * transações existem até "hoje + HORIZON_MONTHS". Como a rotina roda uma
 * vez por mês e o horizonte anda 1 mês a cada execução, o buffer nunca
 * fica vazio — sem precisar gerar tudo de uma vez (impossível para um
 * plano "sem término").
 */
const HORIZON_MONTHS = 3;

/** Calcula a data de cobrança de um mês específico, ajustando para o
 * último dia do mês quando `dayOfMonth` não existir nele (ex: dia 31 em
 * fevereiro vira 28/29). Sempre retorna a data com hora zerada. */
function resolveOccurrenceDate(monthAnchor: Date, dayOfMonth: number): Date {
  const monthStart = startOfMonth(monthAnchor);
  const lastDay = lastDayOfMonth(monthStart).getDate();
  return setDate(monthStart, Math.min(dayOfMonth, lastDay));
}

/** Zera a hora para comparar datas por dia, ignorando o horário — evita
 * que o momento exato em que o plano foi criado ou a rotina rodou faça
 * a primeira/última ocorrência ser incluída ou excluída por engano. */
function atMidnight(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Gera as ocorrências (Transaction) que ainda faltam para um plano
 * recorrente, entre a última gerada e o horizonte de alguns meses à
 * frente — respeitando `endDate` e `active`. Idempotente: pode ser
 * chamada repetidamente (na criação do plano e a cada execução da
 * rotina mensal) sem duplicar ocorrências.
 *
 * Retorna o número de ocorrências criadas.
 */
export async function generatePendingOccurrences(
  plan: RecurringPlan,
): Promise<number> {
  if (!plan.active || plan.deletedAt) return 0;

  const horizon = atMidnight(addMonths(new Date(), HORIZON_MONTHS));
  const startDate = atMidnight(plan.startDate);
  const endDate = plan.endDate ? atMidnight(plan.endDate) : null;

  // Próximo mês a gerar: o mês seguinte ao da última ocorrência gerada,
  // ou o mês de início do plano se ainda não gerou nenhuma. `cursor` só
  // serve pra apontar o mês/ano a calcular — a única data efetivamente
  // comparada contra horizonte/início/término é sempre `dueDate`, já
  // normalizada (meia-noite), pra não depender do horário exato em que
  // o plano foi criado ou a rotina rodou.
  let cursor = plan.lastGeneratedDate
    ? addMonths(plan.lastGeneratedDate, 1)
    : plan.startDate;

  const occurrences: { dueDate: Date }[] = [];
  // Trava de segurança: nunca itera mais que o horizonte + uma folga,
  // evitando um loop longo demais se `lastGeneratedDate` estiver muito
  // no passado (ex: plano ficou muito tempo sem a rotina rodar).
  const maxIterations = HORIZON_MONTHS + 240;

  for (let i = 0; i < maxIterations; i++) {
    const dueDate = resolveOccurrenceDate(cursor, plan.dayOfMonth);

    if (dueDate > horizon) break;
    if (endDate && dueDate > endDate) break;

    if (dueDate >= startDate) {
      occurrences.push({ dueDate });
    }

    cursor = addMonths(cursor, 1);
  }

  if (occurrences.length === 0) return 0;

  await db.$transaction(async (tx) => {
    await tx.transaction.createMany({
      data: occurrences.map((o) => ({
        userId: plan.userId,
        clientId: plan.clientId,
        categoryId: plan.categoryId,
        recurringPlanId: plan.id,
        name: plan.name,
        description: plan.description,
        amountInCents: plan.amountInCents,
        type: plan.type,
        paymentMethod: plan.paymentMethod,
        dueDate: o.dueDate,
      })),
    });

    await tx.recurringPlan.update({
      where: { id: plan.id },
      data: {
        lastGeneratedDate: occurrences[occurrences.length - 1].dueDate,
      },
    });
  });

  return occurrences.length;
}
