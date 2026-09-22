"use client";

import { DownloadIcon, Loader2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/app/_components/ui/button";

import { exportTransactionsCsv } from "../_actions/export-transactions-csv";
import { TransactionFilters } from "../_actions/get-transactions";

interface ExportCsvButtonProps {
  /** Mesmos filtros aplicados na listagem — exporta o que está filtrado,
   * não só a página atual (ao contrário da tabela, que é paginada). */
  filters: TransactionFilters;
}

export function ExportCsvButton({ filters }: ExportCsvButtonProps) {
  const [isPending, setIsPending] = useState(false);

  const handleClick = async () => {
    setIsPending(true);
    const result = await exportTransactionsCsv(filters);
    setIsPending(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    // Gera o download no navegador a partir do CSV retornado pela action —
    // mesmo padrão do DownloadReceiptButton, sem precisar de uma rota /api.
    const blob = new Blob([result.csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = result.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("CSV exportado");
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="cursor-pointer gap-2"
      onClick={handleClick}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2Icon className="h-4 w-4 animate-spin" />
      ) : (
        <DownloadIcon className="h-4 w-4" />
      )}
      Exportar CSV
    </Button>
  );
}
