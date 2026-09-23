"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Checkbox } from "@/app/_components/ui/checkbox";

import { toggleTransactionStatus } from "../_actions/toggle-transaction-status";
import { ConfirmPaymentDialog } from "./confirm-payment-dialog";

interface TransactionStatusCheckboxProps {
  transactionId: string;
  isPaid: boolean;
  /** Valor atualmente lançado, em centavos — pré-preenche o valor a confirmar. */
  amountInCents: number;
  /**
   * Prefixo do id do checkbox. A tabela (desktop) e a lista de cards (mobile)
   * coexistem no DOM, então cada uma usa um prefixo próprio para evitar ids duplicados.
   */
  idPrefix?: string;
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
  amountInCents,
  idPrefix = "transaction",
}: TransactionStatusCheckboxProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleChange = () => {
    if (isPaid) {
      // Reverter para pendente — sem necessidade de data, executa direto
      startTransition(async () => {
        const result = await toggleTransactionStatus(transactionId);
        if (!result.success) {
          toast.error(result.error);
        }
      });
    } else {
      // Marcar como pago — abre o dialog para confirmar a data
      setDialogOpen(true);
    }
  };

  return (
    <>
      <Checkbox
        id={`${idPrefix}-${transactionId}`}
        checked={isPaid}
        onCheckedChange={handleChange}
        disabled={isPending}
        className="cursor-pointer"
        aria-label={isPaid ? "Marcar como pendente" : "Marcar como pago"}
      />

      <ConfirmPaymentDialog
        transactionId={transactionId}
        amountInCents={amountInCents}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}
