"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

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

interface ChartBarStackedProps {
  data: ChartDataPoint[];
  compact?: boolean;
}

export function ChartBarStacked({
  data,
  compact = false,
}: ChartBarStackedProps) {
  return (
    <ChartContainer config={chartConfig} className="h-full w-full">
      <BarChart
        accessibilityLayer
        data={data}
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
          content={
            <ChartTooltipContent
              formatter={(value) => formatCurrency(Number(value))}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar
          dataKey="income"
          stackId="real"
          fill="var(--color-income)"
          radius={[0, 0, 4, 4]}
        />
        <Bar
          dataKey="expense"
          stackId="real"
          fill="var(--color-expense)"
          radius={[4, 4, 0, 0]}
        />
        {!compact && (
          <>
            <Bar
              dataKey="expectedIncome"
              stackId="expected"
              fill="var(--color-expectedIncome)"
              radius={[0, 0, 4, 4]}
              fillOpacity={0.5}
            />
            <Bar
              dataKey="expectedExpense"
              stackId="expected"
              fill="var(--color-expectedExpense)"
              radius={[4, 4, 0, 0]}
              fillOpacity={0.5}
            />
          </>
        )}
      </BarChart>
    </ChartContainer>
  );
}
