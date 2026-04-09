"use client";

import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

import { Button } from "@/app/_components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/app/_components/ui/chart";

export const description = "A multiple line chart";

const chartData = [
  { month: "January", income: 186, expense: 80 },
  { month: "February", income: 305, expense: 200 },
  { month: "March", income: 237, expense: 120 },
  { month: "April", income: 73, expense: 190 },
  { month: "May", income: 209, expense: 130 },
];

const chartConfig = {
  income: {
    label: "Receita",
    color: "var(--chart-1)",
  },
  expense: {
    label: "Despesa",
    color: "var(--color-destructive)",
  },
} satisfies ChartConfig;

export function ChartLineMultiple() {
  return (
    <Card className="border-border bg-card flex h-[400px] flex-col overflow-hidden rounded-2xl shadow-sm">
      <CardHeader className="flex shrink-0 flex-row items-center justify-between">
        <CardTitle>Receitas e Despesas</CardTitle>
        <Button variant="outline" className="cursor-pointer justify-end">
          Ver mais
        </Button>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden pb-4">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Line
              dataKey="income"
              type="monotone"
              stroke="var(--color-income)"
              strokeWidth={3}
              dot={false}
            />
            <Line
              dataKey="expense"
              type="monotone"
              stroke="var(--color-expense)"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
