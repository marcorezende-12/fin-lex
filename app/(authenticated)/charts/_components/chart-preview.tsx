import Link from "next/link";

import { Button } from "@/app/_components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";

import { ChartDataPoint } from "../_actions/get-chart-data";
import { ChartLineMultiple } from "./line-chart";

interface ChartPreviewProps {
  data: ChartDataPoint[];
}

/**
 * Card compacto do gráfico exibido no dashboard.
 * Usa mode compact (sem YAxis e sem linhas de previsto)
 * para caber no espaço de 1/3 da grid.
 */
export function ChartPreview({ data }: ChartPreviewProps) {
  return (
    <Card className="border-border bg-card flex h-[400px] flex-col overflow-hidden rounded-2xl border shadow-sm">
      <CardHeader className="flex shrink-0 flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">
          Receitas e Despesas
        </CardTitle>
        <Button variant="outline" size="sm" asChild className="cursor-pointer">
          <Link href="/charts">Ver mais</Link>
        </Button>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 pb-4">
        <ChartLineMultiple data={data} compact />
      </CardContent>
    </Card>
  );
}
