import { TrendingDownIcon, TrendingUpIcon, WalletIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { formatCurrency } from "@/app/_lib/utils";

import { ChartDataPoint } from "../../charts/_actions/get-chart-data";
import { ChartBarStacked } from "../../charts/_components/chart-bar";
import { buildMonthlyTrend, summarizeTrend } from "../_lib/period-trend";
import { ProfitTrendChart } from "./profit-trend-chart";

interface PeriodTrendSectionProps {
  year: number;
  trend: ChartDataPoint[];
  /** yearMonth (yyyy-MM) do período selecionado no filtro. */
  highlightYearMonth: string;
}

export function PeriodTrendSection({
  year,
  trend,
  highlightYearMonth,
}: PeriodTrendSectionProps) {
  const summary = summarizeTrend(buildMonthlyTrend(trend));

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h2 className="text-lg font-bold">Tendência do ano de {year}</h2>
        <p className="text-muted-foreground text-sm">
          Lucro realizado mês a mês — o mês selecionado no filtro aparece em
          destaque
        </p>
      </div>

      {summary && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="bg-card border-border flex items-center gap-3 rounded-2xl border p-4 shadow-sm">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/10">
              <WalletIcon className="h-4 w-4 text-blue-500" />
            </div>
            <div className="min-w-0">
              <p className="text-muted-foreground truncate text-xs">
                Lucro médio mensal
              </p>
              <p className="truncate text-base font-bold">
                {formatCurrency(summary.averageProfit)}
              </p>
            </div>
          </div>
          <div className="bg-card border-border flex items-center gap-3 rounded-2xl border p-4 shadow-sm">
            <div className="bg-primary/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
              <TrendingUpIcon className="text-primary h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-muted-foreground truncate text-xs">
                Melhor mês — {summary.bestMonth.month}
              </p>
              <p className="text-primary truncate text-base font-bold">
                {formatCurrency(summary.bestMonth.profit)}
              </p>
            </div>
          </div>
          <div className="bg-card border-border flex items-center gap-3 rounded-2xl border p-4 shadow-sm">
            <div className="bg-destructive/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
              <TrendingDownIcon className="text-destructive h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-muted-foreground truncate text-xs">
                Pior mês — {summary.worstMonth.month}
              </p>
              <p className="text-destructive truncate text-base font-bold">
                {formatCurrency(summary.worstMonth.profit)}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card className="border-border bg-card rounded-2xl border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Lucro por mês
            </CardTitle>
            <p className="text-muted-foreground text-xs">
              Verde = lucro · Vermelho = prejuízo
            </p>
          </CardHeader>
          <CardContent className="h-[280px] pb-6">
            <ProfitTrendChart
              data={trend}
              highlightYearMonth={highlightYearMonth}
            />
          </CardContent>
        </Card>

        <Card className="border-border bg-card rounded-2xl border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Entradas x Saídas por mês
            </CardTitle>
            <p className="text-muted-foreground text-xs">
              Sólido = realizado · Translúcido = previsto
            </p>
          </CardHeader>
          <CardContent className="h-[280px] pb-6">
            <ChartBarStacked data={trend} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
