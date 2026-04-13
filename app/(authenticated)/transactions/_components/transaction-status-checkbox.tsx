"use client";

import { useTransition } from "react";

import { Checkbox } from "@/app/_components/ui/checkbox";

import { toggleTransactionStatus } from "../_actions/toggle-transaction-status";

interface TransactionStatusCheckboxProps {
  transactionId: string;
  isPaid: boolean;
}

export function TransactionStatusCheckbox({
  transactionId,
  isPaid,
}: TransactionStatusCheckboxProps) {
  const [isPending, startTransition] = useTransition();

  const handleChange = () => {
    startTransition(async () => {
      await toggleTransactionStatus(transactionId);
    });
  };

  return (
    <Checkbox
      id={`transaction-${transactionId}`}
      checked={isPaid}
      onCheckedChange={handleChange}
      disabled={isPending}
      className="cursor-pointer"
      aria-label={isPaid ? "Marcar como pendente" : "Marcar como pago"}
    />
  );
}
