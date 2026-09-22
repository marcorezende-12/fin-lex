"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/app/_components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";

const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

interface PeriodResultFilterProps {
  period: "month" | "year";
  year: number;
  month: number;
  availableYears: number[];
}

export function PeriodResultFilter({
  period,
  year,
  month,
  availableYears,
}: PeriodResultFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1 rounded-lg border p-1">
        {(["month", "year"] as const).map((p) => (
          <Button
            key={p}
            variant={period === p ? "secondary" : "ghost"}
            size="sm"
            className="cursor-pointer"
            onClick={() => updateParam("period", p)}
          >
            {p === "month" ? "Mês" : "Ano"}
          </Button>
        ))}
      </div>

      {period === "month" && (
        <Select
          value={String(month)}
          onValueChange={(v) => updateParam("month", v)}
        >
          <SelectTrigger className="w-full cursor-pointer sm:w-[160px]">
            <SelectValue placeholder="Mês" />
          </SelectTrigger>
          <SelectContent>
            {MONTH_NAMES.map((name, index) => (
              <SelectItem key={name} value={String(index + 1)}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Select
        value={String(year)}
        onValueChange={(v) => updateParam("year", v)}
      >
        <SelectTrigger className="w-full cursor-pointer sm:w-[120px]">
          <SelectValue placeholder="Ano" />
        </SelectTrigger>
        <SelectContent>
          {availableYears.map((y) => (
            <SelectItem key={y} value={String(y)}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
