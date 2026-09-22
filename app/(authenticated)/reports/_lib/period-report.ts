import { formatCurrency } from "@/app/_lib/utils";

import { PeriodResult } from "../_actions/get-period-result";

export function buildPeriodNarrative(report: PeriodResult): string {
  const toCurrency = (cents: number) => formatCurrency(cents / 100);

  const profitSentence =
    report.profit >= 0
      ? `resultando em lucro de ${toCurrency(report.profit)}`
      : `resultando em prejuízo de ${toCurrency(Math.abs(report.profit))}`;

  let text =
    `Em ${report.periodLabel}, o escritório teve entrada de ` +
    `${toCurrency(report.actualIncome)} em receitas recebidas e saída de ` +
    `${toCurrency(report.actualExpense)} em despesas pagas, ${profitSentence}.`;

  if (report.expectedIncome > 0 || report.expectedExpense > 0) {
    text +=
      ` Além disso, há ${toCurrency(report.expectedIncome)} em receitas e ` +
      `${toCurrency(report.expectedExpense)} em despesas ainda pendentes ` +
      `para o período.`;
  }

  return text;
}
