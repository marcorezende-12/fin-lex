import { ChartDataPoint } from "../../charts/_actions/get-chart-data";

/** Lucro realizado (receita paga - despesa paga) de um mês, em reais. */
export interface MonthlyProfitPoint {
  month: string;
  yearMonth: string;
  income: number;
  expense: number;
  profit: number;
}

export function buildMonthlyTrend(
  data: ChartDataPoint[],
): MonthlyProfitPoint[] {
  return data.map((point) => ({
    month: point.month,
    yearMonth: point.yearMonth,
    income: point.income,
    expense: point.expense,
    profit: point.income - point.expense,
  }));
}

export interface TrendSummary {
  averageProfit: number;
  bestMonth: MonthlyProfitPoint;
  worstMonth: MonthlyProfitPoint;
}

/**
 * Resumo do ano usado tanto na tela quanto no PDF. Só considera meses com
 * alguma movimentação (senão o "melhor/pior mês" seria só o primeiro mês
 * vazio do array em caso de empate).
 */
export function summarizeTrend(
  points: MonthlyProfitPoint[],
): TrendSummary | null {
  const withActivity = points.filter(
    (point) => point.income > 0 || point.expense > 0,
  );
  if (withActivity.length === 0) return null;

  const averageProfit =
    withActivity.reduce((sum, point) => sum + point.profit, 0) /
    withActivity.length;

  const bestMonth = withActivity.reduce((best, point) =>
    point.profit > best.profit ? point : best,
  );
  const worstMonth = withActivity.reduce((worst, point) =>
    point.profit < worst.profit ? point : worst,
  );

  return { averageProfit, bestMonth, worstMonth };
}
