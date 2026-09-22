"use client";

import { DownloadIcon, Loader2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/app/_components/ui/button";
import { DEFAULT_RECEIPT_TEMPLATE } from "@/app/_lib/receipt-tokens";

import { getReceiptTemplate } from "../../settings/_actions/receipt-template-actions";
import { OverdueReport } from "../_actions/get-overdue-clients";
import { buildOverduePdf } from "../_lib/overdue-pdf";

interface DownloadOverduePdfButtonProps {
  report: OverdueReport;
}

/**
 * Gera e baixa o PDF direto no navegador (jsPDF, sem html2canvas) — mesmo
 * padrão do DownloadReceiptButton. Busca o template de recibo só pelo
 * logo/nome do escritório (timbre), sem usar o corpo/textos do recibo.
 */
export function DownloadOverduePdfButton({
  report,
}: DownloadOverduePdfButtonProps) {
  const [isPending, setIsPending] = useState(false);

  const handleClick = async () => {
    setIsPending(true);
    try {
      const templateResult = await getReceiptTemplate();
      const template =
        templateResult.success && templateResult.data
          ? templateResult.data
          : DEFAULT_RECEIPT_TEMPLATE;

      const pdf = buildOverduePdf(
        { logoDataUrl: template.logoDataUrl, title: template.title },
        report,
      );
      pdf.save("relatorio-inadimplencia.pdf");
    } catch {
      toast.error("Não foi possível gerar o relatório");
    } finally {
      setIsPending(false);
    }
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
      Baixar PDF
    </Button>
  );
}
