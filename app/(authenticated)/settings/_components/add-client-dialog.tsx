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

import { ClientForm } from "./client-form";

/**
 * Botão + Dialog para adicionar um novo cliente.
 * O formulário fecha o dialog automaticamente ao salvar com sucesso.
 */
export function AddClientDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer gap-2">
          <PlusIcon className="h-4 w-4" />
          Novo Cliente
        </Button>
      </DialogTrigger>

      <DialogContent
        scrollable={false}
        className="flex max-h-[90dvh] flex-col sm:max-w-lg"
      >
        <DialogHeader>
          <DialogTitle>Novo Cliente</DialogTitle>
          <DialogDescription>
            Preencha os dados para cadastrar um novo cliente.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-2 pr-1">
          <ClientForm onSuccess={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
