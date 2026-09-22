"use client";

import { useRouter, useSearchParams } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";

const WINDOW_OPTIONS = [
  { value: "7", label: "Próximos 7 dias" },
  { value: "15", label: "Próximos 15 dias" },
  { value: "30", label: "Próximos 30 dias" },
  { value: "60", label: "Próximos 60 dias" },
];

interface WindowDaysFilterProps {
  value: number;
}

export function WindowDaysFilter({ value }: WindowDaysFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateWindow = (days: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("days", days);
    router.push(`?${params.toString()}`);
  };

  return (
    <Select value={String(value)} onValueChange={updateWindow}>
      <SelectTrigger className="w-full cursor-pointer sm:w-[180px]">
        <SelectValue placeholder="Período" />
      </SelectTrigger>
      <SelectContent>
        {WINDOW_OPTIONS.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
