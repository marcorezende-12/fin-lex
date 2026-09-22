import { addMonths, subMonths } from "date-fns";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";

import {
  getAvailableChartYears,
  getChartData,
} from "./_actions/get-chart-data";
import { ChartBarStacked } from "./_components/chart-bar";
import {
  ChartFilters,
  ChartPeriodFilter,
  LineView,
} from "./_components/chart-filters";
import { ChartLineMultiple } from "./_components/line-chart";

interface ChartsPageProps {
  searchParams: Promise<{
    chart?: string;
    offset?: string;
    view?: string;
    period?: string;
    year?: string;
  }>;
}

const ChartsPage = async ({ searchParams }: ChartsPageProps) => {
  const { chart, offset, view, period, year } = await searchParams;

  const chartType = chart === "bar" ? "bar" : "line";
  const lineView: LineView = view === "expected" ? "expected" : "real";
  const chartPeriod: ChartPeriodFilter = period === "year" ? "year" : "months";

  // No período "Ano", a data de referência é só o ano escolhido (dia/mês não
  // importam — getChartData usa só o ano quando period="year").
  const centerMonth =
    chartPeriod === "year"
      ? new Date(year ? parseInt(year, 10) : new Date().getFullYear(), 0, 1)
      : (() => {
          const monthOffset = parseInt(offset ?? "0", 10);
          return monthOffset > 0
            ? addMonths(new Date(), monthOffset)
            : monthOffset < 0
              ? subMonths(new Date(), Math.abs(monthOffset))
              : new Date();
        })();

  const [result, yearsResult] = await Promise.all([
    getChartData(centerMonth, chartPeriod),
    getAvailableChartYears(),
  ]);
  const chartData = result.success ? result.data : [];
  const availableYears = yearsResult.success
    ? yearsResult.data
    : [new Date().getFullYear()];

  return (
    <div className="flex flex-col gap-6">
      {/* CABEÇALHO */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Gráficos</h1>
          <p className="text-muted-foreground text-sm">
            Visualize receitas e despesas ao longo do tempo
          </p>
        </div>
      </div>

      {/* FILTROS */}
      <ChartFilters availableYears={availableYears} />

      {/* GRÁFICO PRINCIPAL */}
      {!result.success ? (
        <div className="text-destructive text-sm">{result.error}</div>
      ) : (
        <Card className="border-border bg-card rounded-2xl border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              {chartType === "line"
                ? lineView === "real"
                  ? "Receita Real × Despesa Real"
                  : "Receita Prevista × Despesa Prevista"
                : "Receitas e Despesas — Barras"}
              {chartPeriod === "year" && ` — ${centerMonth.getFullYear()}`}
            </CardTitle>
            <p className="text-muted-foreground text-xs">
              {chartPeriod === "year"
                ? "Visão anual: janeiro a dezembro"
                : chartType === "line"
                  ? lineView === "real"
                    ? "Valores de transações já pagas/recebidas"
                    : "Valores de transações ainda pendentes"
                  : "Linhas contínuas = realizados · Tracejadas = previstos"}
            </p>
          </CardHeader>
          <CardContent className="h-[400px] pb-6">
            {chartType === "line" ? (
              <ChartLineMultiple data={chartData} view={lineView} />
            ) : (
              <ChartBarStacked data={chartData} />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ChartsPage;
