"use client";

import { TrashIcon } from "lucide-react";

import { Button } from "@/app/_components/ui/button";

import { deleteClient } from "../_actions/client-actions";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";

interface DeleteClientButtonProps {
  clientId: string;
  clientName: string;
}

export function DeleteClientButton({
  clientId,
  clientName,
}: DeleteClientButtonProps) {
  return (
    <DeleteConfirmDialog
      trigger={
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive h-8 w-8 cursor-pointer rounded-full"
          aria-label={`Excluir cliente ${clientName}`}
        >
          <TrashIcon className="h-4 w-4" />
        </Button>
      }
      title={`Excluir "${clientName}"?`}
      description="Esta ação não pode ser desfeita. As transações vinculadas a este cliente não serão excluídas, mas perderão a referência ao cliente."
      onConfirm={async () => {
        await deleteClient(clientId);
      }}
    />
  );
}
