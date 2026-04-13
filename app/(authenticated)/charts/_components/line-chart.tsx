"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/app/_components/ui/chart";
import { formatCurrency } from "@/app/_lib/utils";

import { ChartDataPoint } from "../_actions/get-chart-data";
import { LineView } from "../_components/chart-filters";

// Mesmas cores dos cards do dashboard:
// primary (verde) → receita | destructive (vermelho) → despesa
const chartConfig = {
  income: {
    label: "Receita Real",
    color: "var(--color-primary)",
  },
  expense: {
    label: "Despesa Real",
    color: "var(--color-destructive)",
  },
  expectedIncome: {
    label: "Receita Prevista",
    color: "var(--color-primary)",
  },
  expectedExpense: {
    label: "Despesa Prevista",
    color: "var(--color-destructive)",
  },
} satisfies ChartConfig;

interface ChartLineMultipleProps {
  data: ChartDataPoint[];
  /**
   * @deprecated Use hideYAxis em vez disso.
   * Mantido por compatibilidade — quando true força view="real" e oculta YAxis.
   */
  compact?: boolean;
  /**
   * Controla quais linhas são exibidas:
   * - "real"     → Receita Real + Despesa Real (padrão)
   * - "expected" → Receita Prevista + Despesa Prevista
   */
  view?: LineView;
  /** Quando true, omite o eixo Y (útil em espaços reduzidos) */
  hideYAxis?: boolean;
}

export function ChartLineMultiple({
  data,
  compact = false,
  view = "real",
  hideYAxis = false,
}: ChartLineMultipleProps) {
  const showReal = view === "real";
  const showExpected = view === "expected";
  const showYAxis = !compact && !hideYAxis;

  return (
    <ChartContainer config={chartConfig} className="h-full w-full">
      <LineChart
        accessibilityLayer
        data={data}
        margin={{ left: 8, right: 8, top: 8, bottom: 0 }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ fontSize: 12 }}
        />
        {showYAxis && (
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tick={{ fontSize: 11 }}
            tickFormatter={(v: number) =>
              v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
            }
          />
        )}
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              formatter={(value) => formatCurrency(Number(value))}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />

        {/* LINHAS REAIS */}
        {showReal && (
          <>
            <Line
              dataKey="income"
              type="monotone"
              stroke="var(--color-income)"
              strokeWidth={2.5}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              dataKey="expense"
              type="monotone"
              stroke="var(--color-expense)"
              strokeWidth={2.5}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </>
        )}

        {/* LINHAS PREVISTAS — mesma cor, traço diferente e leve opacidade */}
        {showExpected && (
          <>
            <Line
              dataKey="expectedIncome"
              type="monotone"
              stroke="var(--color-expectedIncome)"
              strokeWidth={2.5}
              strokeDasharray="6 4"
              strokeOpacity={0.65}
              dot={{ r: 3, fillOpacity: 0.65 }}
              activeDot={{ r: 5 }}
            />
            <Line
              dataKey="expectedExpense"
              type="monotone"
              stroke="var(--color-expectedExpense)"
              strokeWidth={2.5}
              strokeDasharray="6 4"
              strokeOpacity={0.65}
              dot={{ r: 3, fillOpacity: 0.65 }}
              activeDot={{ r: 5 }}
            />
          </>
        )}
      </LineChart>
    </ChartContainer>
  );
}
