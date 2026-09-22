"use client";

import { DownloadIcon, Loader2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/app/_components/ui/button";
import { DEFAULT_RECEIPT_TEMPLATE } from "@/app/_lib/receipt-tokens";

import { getReceiptTemplate } from "../../settings/_actions/receipt-template-actions";
import { UpcomingReport } from "../_actions/get-upcoming-charges";
import { buildUpcomingPdf } from "../_lib/upcoming-pdf";

interface DownloadUpcomingPdfButtonProps {
  report: UpcomingReport;
}

export function DownloadUpcomingPdfButton({
  report,
}: DownloadUpcomingPdfButtonProps) {
  const [isPending, setIsPending] = useState(false);

  const handleClick = async () => {
    setIsPending(true);
    try {
      const templateResult = await getReceiptTemplate();
      const template =
        templateResult.success && templateResult.data
          ? templateResult.data
          : DEFAULT_RECEIPT_TEMPLATE;

      const pdf = buildUpcomingPdf(
        { logoDataUrl: template.logoDataUrl, title: template.title },
        report,
      );
      pdf.save("relatorio-proximas-cobrancas.pdf");
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
