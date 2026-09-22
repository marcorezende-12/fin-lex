import { formatCurrency } from "@/app/_lib/utils";

import { UpcomingReport } from "../_actions/get-upcoming-charges";

export function buildUpcomingNarrative(report: UpcomingReport): string {
  if (report.charges.length === 0) {
    return `Não há cobranças previstas para os próximos ${report.windowDays} dias.`;
  }

  const chargeWord =
    report.charges.length === 1
      ? "1 cobrança prevista"
      : `${report.charges.length} cobranças previstas`;

  return (
    `Este relatório lista ${chargeWord} para os próximos ${report.windowDays} ` +
    `dias, totalizando ${formatCurrency(report.totalInCents / 100)} a receber.`
  );
}
