import { addMonths, subMonths } from "date-fns";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";

import { getChartData } from "./_actions/get-chart-data";
import { ChartBarStacked } from "./_components/chart-bar";
import { ChartFilters } from "./_components/chart-filters";
import { ChartLineMultiple } from "./_components/line-chart";

interface ChartsPageProps {
  searchParams: Promise<{
    chart?: string;
    offset?: string;
  }>;
}

const ChartsPage = async ({ searchParams }: ChartsPageProps) => {
  const { chart, offset } = await searchParams;

  const chartType = chart === "bar" ? "bar" : "line";

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
                ? "Receitas e Despesas — Linha"
                : "Receitas e Despesas — Barras"}
            </CardTitle>
            <p className="text-muted-foreground text-xs">
              Linhas contínuas = valores realizados · Linhas tracejadas =
              valores previstos
            </p>
          </CardHeader>
          <CardContent className="h-[400px] pb-6">
            {chartType === "line" ? (
              <ChartLineMultiple data={chartData} />
            ) : (
              <ChartBarStacked data={chartData} />
            )}
          </CardContent>
        </Card>
      )}

      {/* LEGENDA DE CONCEITOS */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          {
            color: "bg-[var(--chart-1)]",
            label: "Receita Real",
            desc: "Pagamentos confirmados",
          },
          {
            color: "bg-destructive",
            label: "Despesa Real",
            desc: "Gastos confirmados",
          },
          {
            color: "bg-[var(--chart-2)] opacity-60",
            label: "Receita Prevista",
            desc: "Pagamentos pendentes",
          },
          {
            color: "bg-[var(--chart-4)] opacity-60",
            label: "Despesa Prevista",
            desc: "Gastos pendentes",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="border-border bg-card flex items-start gap-3 rounded-xl border p-4 shadow-sm"
          >
            <span
              className={`mt-0.5 h-3 w-3 shrink-0 rounded-full ${item.color}`}
            />
            <div>
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-muted-foreground text-xs">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChartsPage;
