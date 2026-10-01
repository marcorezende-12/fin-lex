"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useEffect, useState } from "react";

import { Button } from "@/app/_components/ui/button";
import { Checkbox } from "@/app/_components/ui/checkbox";
import { DateInput } from "@/app/_components/ui/date-input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog";

interface RecurringDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  /** Data escolhida no formulário principal — define o dia do mês da cobrança. */
  startDate: Date;
  defaultEndDate?: Date | null;
  onSave: (endDate: Date | null) => void;
}

/**
 * Dialog de configuração de recorrência mensal.
 *
 * Pede apenas a data de término (opcional) — o dia da cobrança já vem do
 * campo "Data" do formulário principal, sem precisar duplicar essa
 * pergunta aqui (diferente do InstallmentsDialog, que precisa da data
 * inicial porque calcula N datas futuras de uma vez).
 */
export function RecurringDialog({
  isOpen,
  setIsOpen,
  startDate,
  defaultEndDate,
  onSave,
}: RecurringDialogProps) {
  const [hasEndDate, setHasEndDate] = useState(false);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (isOpen) {
      setHasEndDate(!!defaultEndDate);
      setEndDate(defaultEndDate ?? undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleConfirm = () => {
    onSave(hasEndDate ? (endDate ?? null) : null);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">
            Configurar Recorrência
          </DialogTitle>
          <DialogDescription className="text-center">
            Essa movimentação será repetida todo dia{" "}
            {format(startDate, "dd", { locale: ptBR })} de cada mês.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="has-end-date"
              checked={hasEndDate}
              onCheckedChange={(checked) => setHasEndDate(checked === true)}
              className="cursor-pointer"
            />
            <label
              htmlFor="has-end-date"
              className="cursor-pointer text-sm select-none"
            >
              Definir data de término
            </label>
          </div>

          {hasEndDate ? (
            <DateInput
              aria-label="Data de término"
              value={endDate}
              onChange={setEndDate}
              isDateDisabled={(date) => date < startDate}
            />
          ) : (
            <p className="text-muted-foreground bg-muted/50 rounded-md border p-3 text-center text-sm">
              Sem término — a cobrança se repete todo mês indefinidamente, até
              você encerrar a recorrência.
            </p>
          )}
        </div>

        <DialogFooter className="mt-6 grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="cursor-pointer"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={hasEndDate && !endDate}
            className="cursor-pointer"
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
