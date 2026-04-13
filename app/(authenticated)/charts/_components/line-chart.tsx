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

const chartConfig = {
  income: {
    label: "Receita Real",
    color: "var(--chart-1)",
  },
  expense: {
    label: "Despesa Real",
    color: "var(--color-destructive)",
  },
  expectedIncome: {
    label: "Receita Prevista",
    color: "var(--chart-2)",
  },
  expectedExpense: {
    label: "Despesa Prevista",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

interface ChartLineMultipleProps {
  data: ChartDataPoint[];
  /** Quando true, oculta as linhas de previsto (modo compacto para o dashboard) */
  compact?: boolean;
}

export function ChartLineMultiple({
  data,
  compact = false,
}: ChartLineMultipleProps) {
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
        {!compact && (
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
        {!compact && (
          <>
            <Line
              dataKey="expectedIncome"
              type="monotone"
              stroke="var(--color-expectedIncome)"
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={false}
            />
            <Line
              dataKey="expectedExpense"
              type="monotone"
              stroke="var(--color-expectedExpense)"
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={false}
            />
          </>
        )}
      </LineChart>
    </ChartContainer>
  );
}
