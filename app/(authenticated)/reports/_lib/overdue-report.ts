import { formatCurrency } from "@/app/_lib/utils";

import { OverdueReport } from "../_actions/get-overdue-clients";

/**
 * Texto narrativo gerado a partir dos dados — usado tanto na tela quanto
 * no PDF, pra um documento exportado fazer sentido sozinho (compartilhado
 * por e-mail/WhatsApp) sem precisar do resto do app pra dar contexto.
 */
export function buildOverdueNarrative(report: OverdueReport): string {
  if (report.clients.length === 0) {
    return "Nenhuma movimentação em atraso no momento.";
  }

  // A linha "Sem cliente vinculado" (clientId null) não é um cliente de
  // verdade — separa pra não dizer "N clientes" contando ela junto.
  const clientCount = report.clients.filter((c) => c.clientId !== null).length;
  const hasUnlinked = report.clients.some((c) => c.clientId === null);

  const total = formatCurrency(report.totalOverdueInCents / 100);

  if (clientCount === 0) {
    return (
      `Há movimentações em atraso sem cliente vinculado, totalizando ` +
      `${total} em valores pendentes até a data de hoje.`
    );
  }

  const subject =
    clientCount === 1 ? "1 cliente está" : `${clientCount} clientes estão`;
  const unlinkedNote = hasUnlinked
    ? " Há também movimentações em atraso sem cliente vinculado."
    : "";

  return (
    `Atualmente, ${subject} com movimentações em atraso, totalizando ` +
    `${total} em valores pendentes até a data de hoje.${unlinkedNote}`
  );
}
