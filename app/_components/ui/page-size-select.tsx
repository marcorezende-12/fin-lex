"use client";

import { useRouter, useSearchParams } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
export const DEFAULT_PAGE_SIZE = 20;

/**
 * Lê o `pageSize` da URL, aceitando só os valores oferecidos no seletor —
 * qualquer outro valor (ou ausência) cai no padrão.
 */
export function parsePageSize(value: string | undefined): number {
  const size = Number(value);
  return (PAGE_SIZE_OPTIONS as readonly number[]).includes(size)
    ? size
    : DEFAULT_PAGE_SIZE;
}

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
