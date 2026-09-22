"use client";

import { Checkbox } from "@/app/_components/ui/checkbox";

import { BulkDeleteButton } from "./bulk-delete-button";

interface BulkActionsBarProps {
  allSelected: boolean;
  onToggleAll: (checked: boolean) => void;
  selectedIds: string[];
  onDeleted: () => void;
}

/**
 * Barra de seleção em massa, exibida acima da tabela/lista de transações.
 * Única — compartilhada entre desktop e mobile — porque a lista de cards
 * mobile não tem um cabeçalho próprio onde encaixar isso.
 */
export function BulkActionsBar({
  allSelected,
  onToggleAll,
  selectedIds,
  onDeleted,
}: BulkActionsBarProps) {
  return (
    <div className="flex items-center gap-3 px-1">
      <Checkbox
        id="select-all-transactions"
        checked={allSelected}
        onCheckedChange={(checked) => onToggleAll(checked === true)}
        className="cursor-pointer"
      />
      <label
        htmlFor="select-all-transactions"
        className="text-muted-foreground cursor-pointer text-sm select-none"
      >
        Selecionar todas
      </label>

      {selectedIds.length > 0 && (
        <>
          <span className="text-muted-foreground text-sm">
            {selectedIds.length}{" "}
            {selectedIds.length === 1 ? "selecionada" : "selecionadas"}
          </span>
          <BulkDeleteButton
            transactionIds={selectedIds}
            onDeleted={onDeleted}
          />
        </>
      )}
    </div>
  );
}
