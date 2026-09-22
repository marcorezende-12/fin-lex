"use client";

import { TrashIcon } from "lucide-react";

import { DeleteConfirmDialog } from "@/app/_components/delete-confirm-dialog";
import { Button } from "@/app/_components/ui/button";

import { deleteCategory } from "../_actions/category-actions";

interface DeleteCategoryButtonProps {
  categoryId: string;
  categoryName: string;
  disabled?: boolean;
}

export function DeleteCategoryButton({
  categoryId,
  categoryName,
  disabled,
}: DeleteCategoryButtonProps) {
  return (
    <DeleteConfirmDialog
      trigger={
        <Button
          variant="ghost"
          size="icon"
          disabled={disabled}
          className="text-muted-foreground hover:text-destructive h-8 w-8 cursor-pointer rounded-full"
          aria-label={`Excluir categoria ${categoryName}`}
        >
          <TrashIcon className="h-4 w-4" />
        </Button>
      }
      title={`Excluir "${categoryName}"?`}
      description="Esta ação não pode ser desfeita. As transações vinculadas a esta categoria não serão excluídas, mas perderão a classificação."
      successMessage="Categoria excluída"
      onConfirm={() => deleteCategory(categoryId)}
    />
  );
}
