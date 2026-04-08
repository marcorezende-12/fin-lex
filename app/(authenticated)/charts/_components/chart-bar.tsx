"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

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

export const description = "A stacked bar chart with a legend";

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

export function ChartBarStacked() {
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
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="income"
              stackId="a"
              fill="var(--color-income)"
              radius={[0, 0, 4, 4]}
            />
            <Bar
              dataKey="expense"
              stackId="a"
              fill="var(--color-expense)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
