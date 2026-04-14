"use client";

import { useState, useTransition } from "react";

import { Checkbox } from "@/app/_components/ui/checkbox";

import { toggleTransactionStatus } from "../_actions/toggle-transaction-status";
import { ConfirmPaymentDialog } from "./confirm-payment-dialog";

interface TransactionStatusCheckboxProps {
  transactionId: string;
  isPaid: boolean;
}

/**
 * Checkbox de status da transação.
 *
 * - Marcar como PAGO → abre dialog para confirmar a data de pagamento.
 * - Desmarcar (reverter para PENDENTE) → executa diretamente sem confirmação.
 */
export function TransactionStatusCheckbox({
  transactionId,
  isPaid,
}: TransactionStatusCheckboxProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleChange = () => {
    if (isPaid) {
      // Reverter para pendente — sem necessidade de data, executa direto
      startTransition(async () => {
        await toggleTransactionStatus(transactionId);
      });
    } else {
      // Marcar como pago — abre o dialog para confirmar a data
      setDialogOpen(true);
    }
  };

  return (
    <>
      <Checkbox
        id={`transaction-${transactionId}`}
        checked={isPaid}
        onCheckedChange={handleChange}
        disabled={isPending}
        className="cursor-pointer"
        aria-label={isPaid ? "Marcar como pendente" : "Marcar como pago"}
      />

      <ConfirmPaymentDialog
        transactionId={transactionId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}
