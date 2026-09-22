"use client";

import { DownloadIcon, Loader2Icon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/app/_components/ui/button";
import { buildReceiptPdf } from "@/app/_lib/build-receipt-pdf";
import { DEFAULT_RECEIPT_TEMPLATE } from "@/app/_lib/receipt-tokens";

import { getReceiptData } from "../_actions/get-receipt-data";
import { buildReceiptTokens, slugify } from "../_utils/build-receipt-tokens";

interface DownloadReceiptButtonProps {
  transactionId: string;
  transactionName: string;
}

/**
 * Botão de ícone exibido apenas em transações pagas. Busca os dados do
 * recibo e gera o PDF desenhando texto diretamente com jsPDF (sem tirar
 * "print" da tela via html2canvas), evitando bugs de canvas readback em
 * navegadores com proteções de privacidade mais estritas.
 */
export function DownloadReceiptButton({
  transactionId,
  transactionName,
}: DownloadReceiptButtonProps) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setError(null);
    setIsPending(true);

    const result = await getReceiptData(transactionId);
    if (!result.success) {
      setError(result.error);
      setIsPending(false);
      return;
    }

    try {
      const template = result.data.template ?? DEFAULT_RECEIPT_TEMPLATE;
      const tokens = buildReceiptTokens(result.data);
      const pdf = buildReceiptPdf(template, tokens);

      const clientPart = slugify(result.data.clientName ?? "cliente");
      const datePart = result.data.paidAt
        ? new Date(result.data.paidAt).toISOString().slice(0, 10)
        : "recibo";
      pdf.save(`recibo-${clientPart}-${datePart}.pdf`);
    } catch {
      setError("Não foi possível gerar o recibo");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="text-muted-foreground hover:text-foreground h-8 w-8 cursor-pointer rounded-full"
      aria-label={`Baixar recibo de ${transactionName}`}
      title={error ?? undefined}
      onClick={handleClick}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2Icon className="h-4 w-4 animate-spin" />
      ) : (
        <DownloadIcon className="h-4 w-4" />
      )}
    </Button>
  );
}
