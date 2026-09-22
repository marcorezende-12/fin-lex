"use client";

import { AlertTriangleIcon, Trash2Icon } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/app/_components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog";

import { bulkDeleteTransactions } from "../_actions/delete-transaction";

interface BulkDeleteButtonProps {
  transactionIds: string[];
  onDeleted: () => void;
}

/**
 * Botão de exclusão em massa das movimentações selecionadas.
 *
 * Exige dupla confirmação — dois diálogos em sequência — antes de excluir,
 * já que a ação afeta várias movimentações de uma vez e não pode ser
 * desfeita (diferente do DeleteTransactionButton de uma única transação,
 * que usa apenas um diálogo).
 */
export function BulkDeleteButton({
  transactionIds,
  onDeleted,
}: BulkDeleteButtonProps) {
  const [step, setStep] = useState<"closed" | "confirm" | "final">("closed");
  const [isPending, startTransition] = useTransition();

  const count = transactionIds.length;
  const plural = count === 1 ? "movimentação" : "movimentações";

  const close = () => {
    if (isPending) return;
    setStep("closed");
  };

  const handleConfirmDelete = () => {
    startTransition(async () => {
      const result = await bulkDeleteTransactions(transactionIds);
      if (!result.success) {
        toast.error(result.error);
        setStep("closed");
        return;
      }
      toast.success(
        result.count === 1
          ? "1 movimentação excluída"
          : `${result.count} movimentações excluídas`,
      );
      setStep("closed");
      onDeleted();
    });
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-destructive h-8 w-8 cursor-pointer rounded-full"
        aria-label={`Excluir ${count} movimentações selecionadas`}
        onClick={() => setStep("confirm")}
      >
        <Trash2Icon className="h-4 w-4" />
      </Button>

      {/* ETAPA 1 */}
      <Dialog
        open={step === "confirm"}
        onOpenChange={(open) => !open && close()}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="bg-destructive/10 mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full">
              <AlertTriangleIcon className="text-destructive h-6 w-6" />
            </div>
            <DialogTitle className="text-center">
              Excluir {count} {plural}?
            </DialogTitle>
            <DialogDescription className="text-center">
              Esta ação não pode ser desfeita. Todas as movimentações
              selecionadas serão excluídas permanentemente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2 grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={close}
              className="cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => setStep("final")}
              className="cursor-pointer"
            >
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ETAPA 2 — confirmação final */}
      <Dialog open={step === "final"} onOpenChange={(open) => !open && close()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="bg-destructive/10 mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full">
              <AlertTriangleIcon className="text-destructive h-6 w-6" />
            </div>
            <DialogTitle className="text-center">
              Tem certeza mesmo?
            </DialogTitle>
            <DialogDescription className="text-center">
              Confirme novamente: {count} {plural}{" "}
              {count === 1 ? "será excluída" : "serão excluídas"} em definitivo,
              sem possibilidade de recuperação.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2 grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={close}
              disabled={isPending}
              className="cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isPending}
              className="cursor-pointer"
            >
              {isPending ? "Excluindo..." : "Sim, excluir tudo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
