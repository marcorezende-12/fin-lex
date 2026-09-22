"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/app/_components/ui/button";

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  /** Nome do parâmetro de página na URL (padrão: "page"). */
  paramName?: string;
}

/**
 * Controles de paginação (Anterior / Próxima + "Página X de Y") via query
 * string — reaproveitado entre /transactions e o extrato por cliente.
 * Não renderiza nada quando há só uma página.
 */
export function PaginationControls({
  page,
  totalPages,
  paramName = "page",
}: PaginationControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const goToPage = (target: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (target <= 1) {
      params.delete(paramName);
    } else {
      params.set(paramName, String(target));
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="cursor-pointer"
        disabled={page <= 1}
        onClick={() => goToPage(page - 1)}
      >
        <ChevronLeftIcon className="h-4 w-4" />
        Anterior
      </Button>
      <span className="text-muted-foreground px-2 text-sm">
        Página {page} de {totalPages}
      </span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="cursor-pointer"
        disabled={page >= totalPages}
        onClick={() => goToPage(page + 1)}
      >
        Próxima
        <ChevronRightIcon className="h-4 w-4" />
      </Button>
    </div>
  );
}
