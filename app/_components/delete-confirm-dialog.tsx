"use client";

import { AlertTriangleIcon } from "lucide-react";
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
  DialogTrigger,
} from "@/app/_components/ui/dialog";

interface DeleteConfirmDialogProps {
  /** Elemento que abre o dialog (ex: botão de lixeira) */
  trigger: React.ReactNode;
  /** Título exibido no dialog */
  title: string;
  /** Descrição/aviso exibido no dialog */
  description: string;
  /**
   * Função assíncrona executada ao confirmar. Deve retornar o resultado da
   * server action para que o dialog saiba se deve fechar (sucesso) ou
   * permanecer aberto exibindo o erro (falha) via toast.
   */
  onConfirm: () => Promise<{ success: boolean; error?: string }>;
  /** Mensagem exibida em toast de sucesso */
  successMessage?: string;
  /** Texto do botão de confirmação (padrão: "Excluir") */
  confirmLabel?: string;
  /** Texto do botão de confirmação enquanto processa (padrão: "Excluindo...") */
  pendingLabel?: string;
}

export function DeleteConfirmDialog({
  trigger,
  title,
  description,
  onConfirm,
  successMessage = "Excluído com sucesso",
  confirmLabel = "Excluir",
  pendingLabel = "Excluindo...",
}: DeleteConfirmDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    startTransition(async () => {
      const result = await onConfirm();
      if (!result.success) {
        toast.error(result.error ?? "Não foi possível excluir");
        return;
      }
      toast.success(successMessage);
      setOpen(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="bg-destructive/10 mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full">
            <AlertTriangleIcon className="text-destructive h-6 w-6" />
          </div>
          <DialogTitle className="text-center">{title}</DialogTitle>
          <DialogDescription className="text-center">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
            className="cursor-pointer"
          >
            Voltar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isPending}
            className="cursor-pointer"
          >
            {isPending ? pendingLabel : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
