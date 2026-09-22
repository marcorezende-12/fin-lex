import { formatCurrency } from "@/app/_lib/utils";

import { OverdueReport } from "../_actions/get-overdue-clients";

/**
 * Texto narrativo gerado a partir dos dados — usado tanto na tela quanto
 * no PDF, pra um documento exportado fazer sentido sozinho (compartilhado
 * por e-mail/WhatsApp) sem precisar do resto do app pra dar contexto.
 */
export function buildOverdueNarrative(report: OverdueReport): string {
  if (report.clients.length === 0) {
    return "Nenhum cliente está com movimentações em atraso no momento.";
  }

  const subject =
    report.clients.length === 1
      ? "1 cliente está"
      : `${report.clients.length} clientes estão`;

  return (
    `Atualmente, ${subject} com movimentações em atraso, totalizando ` +
    `${formatCurrency(report.totalOverdueInCents / 100)} em valores ` +
    `pendentes até a data de hoje.`
  );
}
