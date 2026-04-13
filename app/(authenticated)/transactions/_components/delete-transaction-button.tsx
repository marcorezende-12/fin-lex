"use client";

import { Trash2Icon } from "lucide-react";
import { AlertTriangleIcon } from "lucide-react";
import { useState, useTransition } from "react";

import { Button } from "@/app/_components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/_components/ui/dialog";

import { deleteTransaction } from "../_actions/delete-transaction";

interface DeleteTransactionButtonProps {
  transactionId: string;
  transactionName: string;
}

export function DeleteTransactionButton({
  transactionId,
  transactionName,
}: DeleteTransactionButtonProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    startTransition(async () => {
      await deleteTransaction(transactionId);
      setOpen(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive h-8 w-8 cursor-pointer rounded-full"
          aria-label={`Excluir movimentação ${transactionName}`}
        >
          <Trash2Icon className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="bg-destructive/10 mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full">
            <AlertTriangleIcon className="text-destructive h-6 w-6" />
          </div>
          <DialogTitle className="text-center">
            Excluir movimentação
          </DialogTitle>
          <DialogDescription className="text-center">
            Tem certeza que deseja excluir{" "}
            <span className="font-medium">&quot;{transactionName}&quot;</span>?
            Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-2 grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
            className="cursor-pointer"
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isPending}
            className="cursor-pointer"
          >
            {isPending ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
