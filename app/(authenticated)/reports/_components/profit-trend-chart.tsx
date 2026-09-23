"use client";

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/app/_components/ui/chart";
import { formatCurrency } from "@/app/_lib/utils";

import { ChartDataPoint } from "../../charts/_actions/get-chart-data";

const chartConfig = {
  profit: {
    label: "Lucro",
    color: "var(--color-primary)",
  },
} satisfies ChartConfig;

interface ProfitTrendChartProps {
  data: ChartDataPoint[];
  /** yearMonth (yyyy-MM) do período selecionado no filtro — destacado no gráfico. */
  highlightYearMonth?: string;
}

/** Barra verde = lucro, vermelha = prejuízo, mês selecionado em destaque. */
export function ProfitTrendChart({
  data,
  highlightYearMonth,
}: ProfitTrendChartProps) {
  const chartData = data.map((point) => ({
    ...point,
    profit: point.income - point.expense,
  }));

  return (
    <ChartContainer config={chartConfig} className="h-full w-full">
      <BarChart
        data={chartData}
        margin={{ left: 8, right: 8, top: 8, bottom: 0 }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tick={{ fontSize: 12 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ fontSize: 11 }}
          tickFormatter={(v: number) =>
            Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
          }
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => formatCurrency(Number(value))}
            />
          }
        />
        <Bar dataKey="profit" radius={4}>
          {chartData.map((point) => (
            <Cell
              key={point.yearMonth}
              fill={
                point.profit >= 0
                  ? "var(--color-primary)"
                  : "var(--color-destructive)"
              }
              fillOpacity={
                highlightYearMonth && point.yearMonth !== highlightYearMonth
                  ? 0.45
                  : 1
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
