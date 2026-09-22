"use client";

import { DownloadIcon, Loader2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/app/_components/ui/button";
import { DEFAULT_RECEIPT_TEMPLATE } from "@/app/_lib/receipt-tokens";

import { getReceiptTemplate } from "../../settings/_actions/receipt-template-actions";
import { PeriodResult } from "../_actions/get-period-result";
import { buildPeriodPdf } from "../_lib/period-pdf";

interface DownloadPeriodPdfButtonProps {
  report: PeriodResult;
}

export function DownloadPeriodPdfButton({
  report,
}: DownloadPeriodPdfButtonProps) {
  const [isPending, setIsPending] = useState(false);

  const handleClick = async () => {
    setIsPending(true);
    try {
      const templateResult = await getReceiptTemplate();
      const template =
        templateResult.success && templateResult.data
          ? templateResult.data
          : DEFAULT_RECEIPT_TEMPLATE;

      const pdf = buildPeriodPdf(
        { logoDataUrl: template.logoDataUrl, title: template.title },
        report,
      );
      pdf.save(
        `resultado-${report.periodLabel.replace(/\s+/g, "-").toLowerCase()}.pdf`,
      );
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
