"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from "@/app/_lib/page-size";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

interface PageSizeSelectProps {
  pageSize: number;
}

/**
 * Seletor de quantidade de itens por página, sincronizado com o parâmetro
 * `pageSize` da URL. Ao trocar, volta para a página 1.
 */
export function PageSizeSelect({ pageSize }: PageSizeSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (Number(value) === DEFAULT_PAGE_SIZE) {
      params.delete("pageSize");
    } else {
      params.set("pageSize", value);
    }
    params.delete("page");
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="text-muted-foreground flex items-center gap-2 text-sm">
      <span>Exibir</span>
      <Select value={String(pageSize)} onValueChange={handleChange}>
        <SelectTrigger
          className="w-[80px] cursor-pointer"
          aria-label="Movimentações por página"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PAGE_SIZE_OPTIONS.map((size) => (
            <SelectItem key={size} value={String(size)}>
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span>por página</span>
    </div>
  );
}
