"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/app/_components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";

import { ChartDataPoint } from "../_actions/get-chart-data";
import { LineView } from "./chart-filters";
import { ChartLineMultiple } from "./line-chart";

interface ChartPreviewProps {
  data: ChartDataPoint[];
}

const VIEWS: { value: LineView; label: string }[] = [
  { value: "real", label: "Real" },
  { value: "expected", label: "Previsto" },
];

/**
 * Card compacto do gráfico exibido no dashboard.
 * Inclui toggle Real/Previsto gerenciado com estado local (sem alterar a URL).
 */
export function ChartPreview({ data }: ChartPreviewProps) {
  const [view, setView] = useState<LineView>("real");

  return (
    <Card className="border-border bg-card flex h-[400px] flex-col overflow-hidden rounded-2xl border shadow-sm">
      <CardHeader className="flex shrink-0 flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="text-base font-semibold">
          {view === "real"
            ? "Receita Real × Despesa Real"
            : "Receita Prevista × Despesa Prevista"}
        </CardTitle>
        <div className="flex items-center gap-2">
          {/* TOGGLE */}
          <div className="flex items-center gap-0.5 rounded-lg border p-0.5">
            {VIEWS.map((v) => (
              <button
                key={v.value}
                onClick={() => setView(v.value)}
                className={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  view === v.value
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="cursor-pointer"
          >
            <Link href="/charts">Ver mais</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 pb-4">
        <ChartLineMultiple data={data} hideYAxis view={view} />
      </CardContent>
    </Card>
  );
}
