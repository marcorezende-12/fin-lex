"use client";

import { CalendarIcon } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/app/_components/ui/button";
import { Calendar } from "@/app/_components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/_components/ui/popover";
import { formatCurrency } from "@/app/_lib/utils";

import { toggleTransactionStatus } from "../_actions/toggle-transaction-status";

interface ConfirmPaymentDialogProps {
  transactionId: string;
  /** Valor atualmente lançado (muitas vezes uma estimativa), em centavos. */
  amountInCents: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Dialog de confirmação de pagamento.
 * Exibe um date picker para o usuário informar a data em que o pagamento ocorreu
 * e um campo de valor, pré-preenchido com o valor lançado, para o usuário ajustar
 * caso o lançamento tenha sido uma estimativa (ex. conta de luz) e o valor real
 * pago tenha sido diferente.
 * Ao confirmar, chama a action passando a data e o valor selecionados.
 */
export function ConfirmPaymentDialog({
  transactionId,
  amountInCents,
  open,
  onOpenChange,
}: ConfirmPaymentDialogProps) {
  const [paidAt, setPaidAt] = useState<Date>(new Date());
  const [paidAmount, setPaidAmount] = useState<number>(amountInCents / 100);
  const [isPending, startTransition] = useTransition();
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);

  const handleConfirm = () => {
    if (paidAmount <= 0) {
      toast.error("O valor deve ser positivo");
      return;
    }
    startTransition(async () => {
      const result = await toggleTransactionStatus(
        transactionId,
        paidAt,
        Math.round(paidAmount * 100),
      );
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Movimentação marcada como paga");
      onOpenChange(false);
    });
  };

  const handleCancel = () => {
    if (isPending) return;
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <div className="bg-primary/10 mx-auto mb-1 flex h-10 w-10 items-center justify-center rounded-full">
            <CalendarIcon className="text-primary h-5 w-5" />
          </div>
          <DialogTitle className="text-center">
            Deseja confirmar esta operação?
          </DialogTitle>
        </DialogHeader>

        {/* DATE PICKER */}
        <div className="flex justify-center py-1">
          <Popover open={isDatePopoverOpen} onOpenChange={setIsDatePopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full cursor-pointer justify-start gap-2 font-normal"
              >
                <CalendarIcon className="text-muted-foreground h-4 w-4" />
                {paidAt.toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "2-digit",
                })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
              <Calendar
                mode="single"
                selected={paidAt}
                onSelect={(date) => {
                  if (date) setPaidAt(date);
                  setIsDatePopoverOpen(false);
                }}
                disabled={(date) => date > new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* VALOR PAGO */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirm-payment-amount">Valor pago</Label>
          <Input
            id="confirm-payment-amount"
            placeholder="R$ 0,00"
            inputMode="numeric"
            value={formatCurrency(paidAmount)}
            onChange={(e) => {
              const rawValue = e.target.value.replace(/\D/g, "");
              setPaidAmount(Number(rawValue) / 100);
            }}
          />
        </div>

        <DialogFooter className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isPending}
            className="cursor-pointer"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isPending}
            className="cursor-pointer"
          >
            {isPending ? "Salvando..." : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
