"use client";

import { BarChart2Icon, LineChartIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

import { Button } from "@/app/_components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";

export type ChartType = "line" | "bar";
export type LineView = "real" | "expected";

const CHART_TYPES: {
  value: ChartType;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "line",
    label: "Linha",
    icon: <LineChartIcon className="h-4 w-4" />,
  },
  {
    value: "bar",
    label: "Barras",
    icon: <BarChart2Icon className="h-4 w-4" />,
  },
];

const MONTH_OPTIONS = [
  { value: "0", label: "Mês atual" },
  { value: "-1", label: "Mês anterior" },
  { value: "-2", label: "2 meses atrás" },
  { value: "-3", label: "3 meses atrás" },
  { value: "1", label: "Próximo mês" },
  { value: "2", label: "Daqui 2 meses" },
];

const LINE_VIEWS: { value: LineView; label: string }[] = [
  { value: "real", label: "Real" },
  { value: "expected", label: "Previsto" },
];

export function ChartFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const chartType = (searchParams.get("chart") as ChartType) ?? "line";
  const monthOffset = searchParams.get("offset") ?? "0";
  const lineView = (searchParams.get("view") as LineView) ?? "real";

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(key, value);
      router.push(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* TIPO DE GRÁFICO */}
      <div className="flex items-center gap-1 rounded-lg border p-1">
        {CHART_TYPES.map((ct) => (
          <Button
            key={ct.value}
            variant={chartType === ct.value ? "secondary" : "ghost"}
            size="sm"
            className="cursor-pointer gap-2"
            onClick={() => updateParam("chart", ct.value)}
          >
            {ct.icon}
            {ct.label}
          </Button>
        ))}
      </div>

      {/* TOGGLE REAL / PREVISTO (apenas para gráfico de linha) */}
      {chartType === "line" && (
        <div className="flex items-center gap-1 rounded-lg border p-1">
          {LINE_VIEWS.map((lv) => (
            <Button
              key={lv.value}
              variant={lineView === lv.value ? "secondary" : "ghost"}
              size="sm"
              className="cursor-pointer"
              onClick={() => updateParam("view", lv.value)}
            >
              {lv.label}
            </Button>
          ))}
        </div>
      )}

      {/* MÊS DE REFERÊNCIA (centro do eixo X) */}
      <Select
        value={monthOffset}
        onValueChange={(v) => updateParam("offset", v)}
      >
        <SelectTrigger className="w-full cursor-pointer sm:w-[180px]">
          <SelectValue placeholder="Período" />
        </SelectTrigger>
        <SelectContent>
          {MONTH_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
