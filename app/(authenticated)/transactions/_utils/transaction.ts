import { differenceInDays, format } from "date-fns";

import { TransactionStatus } from "@/generated/prisma";

/** Informações calculadas para exibição no tooltip do badge de status. */
export interface StatusTooltipInfo {
  highlight: string;
  highlightClass: string;
  detail: string;
}

/**
 * Calcula o conteúdo do tooltip de status com base no status efetivo,
 * data de vencimento e data de pagamento.
 *
 * Função pura — sem efeitos colaterais, testável de forma isolada.
 */
export function getStatusTooltip(
  status: TransactionStatus,
  dueDate: Date,
  paidAt: Date | null,
): StatusTooltipInfo {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  const dueFmt = format(due, "dd/MM/yy");

  if (status === TransactionStatus.OVERDUE) {
    const days = differenceInDays(today, due);
    return {
      highlight: `${days} dia${days !== 1 ? "s" : ""} atrasado`,
      highlightClass: "text-destructive",
      detail: `Data de vencimento: ${dueFmt}`,
    };
  }

  if (status === TransactionStatus.PAID && paidAt) {
    return {
      highlight: `Data de pagamento: ${format(new Date(paidAt), "dd/MM/yy")}`,
      highlightClass: "text-primary",
      detail: `Data de vencimento: ${dueFmt}`,
    };
  }

  // PENDING — a vencer
  const days = differenceInDays(due, today);
  return {
    highlight:
      days === 0
        ? "Vence hoje"
        : `${days} dia${days !== 1 ? "s" : ""} para o vencimento`,
    highlightClass: "text-blue-500",
    detail: `Data de vencimento: ${dueFmt}`,
  };
}

/**
 * Formata o label de parcelamento/recorrência para exibição na tabela
 * (coluna "Parcela"). Retorna "—" quando a transação não é parcelada
 * nem faz parte de uma recorrência.
 */
export function formatInstallmentLabel(
  installmentNumber: number | null,
  totalInstallments: number | null,
  recurringPlanId?: string | null,
): string {
  if (installmentNumber && totalInstallments) {
    return `${installmentNumber}/${totalInstallments}`;
  }
  if (recurringPlanId) {
    return "Recorrente";
  }
  return "—";
}
