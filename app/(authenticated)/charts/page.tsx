import { addMonths, subMonths } from "date-fns";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";

import { getChartData } from "./_actions/get-chart-data";
import { ChartBarStacked } from "./_components/chart-bar";
import { ChartFilters, LineView } from "./_components/chart-filters";
import { ChartLineMultiple } from "./_components/line-chart";

interface ChartsPageProps {
  searchParams: Promise<{
    chart?: string;
    offset?: string;
    view?: string;
  }>;
}

const ChartsPage = async ({ searchParams }: ChartsPageProps) => {
  const { chart, offset, view } = await searchParams;

  const chartType = chart === "bar" ? "bar" : "line";
  const lineView: LineView = view === "expected" ? "expected" : "real";

  // Calcula o mês central a partir do offset (padrão: 0 = mês atual)
  const monthOffset = parseInt(offset ?? "0", 10);
  const centerMonth =
    monthOffset > 0
      ? addMonths(new Date(), monthOffset)
      : monthOffset < 0
        ? subMonths(new Date(), Math.abs(monthOffset))
        : new Date();

  const result = await getChartData(centerMonth);
  const chartData = result.success ? result.data : [];

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
      <ChartFilters />

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
            </CardTitle>
            <p className="text-muted-foreground text-xs">
              {chartType === "line"
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
