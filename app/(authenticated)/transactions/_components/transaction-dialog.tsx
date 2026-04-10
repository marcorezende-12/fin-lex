"use client";

import { PlusIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/app/_components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/_components/ui/dialog";

import { TransactionForm } from "./transaction-form";

export function AddTransactionButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* O botão que abre o modal fica envolvido pelo DialogTrigger */}
      <DialogTrigger asChild>
        <Button className="cursor-pointer font-bold">
          <PlusIcon size={4} className="mr-2" />
          Adicionar Transação
        </Button>
      </DialogTrigger>

      {/* O conteúdo do modal */}
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Transação</DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo para registrar uma nova receita ou despesa.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 pr-2">
          <TransactionForm
            onSuccess={() => setIsOpen(false)}
            onCancel={() => setIsOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
