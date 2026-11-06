"use client";

import { useState } from "react";

import { ScrollArea } from "@/app/_components/ui/scroll-area";
import { Table, TableBody } from "@/app/_components/ui/table";
import { cn } from "@/app/_lib/utils";

import { TransactionRow } from "../_actions/get-transactions";
import { SelectOption } from "../_types";
import { BulkActionsBar } from "./bulk-actions-bar";
import { TransactionCard } from "./transaction-card";
import { TransactionTableRow } from "./transaction-row";
import { TransactionTableHeader } from "./transaction-table-header";

interface TransactionsTableProps {
  transactions: TransactionRow[];
  categories?: SelectOption[];
  clients?: SelectOption[];
  /**
   * Exibe o checkbox "Selecionar todas" + exclusão em massa. Desligado por
   * padrão no preview do dashboard (lista curta, atalho para "Ver mais"),
   * onde ações em massa não fazem sentido.
   */
  showBulkActions?: boolean;
  /**
   * Limita a altura da lista e rola por dentro (cabeçalho da tabela fixo no
   * topo). Usado no dashboard, que mostra várias movimentações num espaço fixo.
   */
  scrollable?: boolean;
}

/**
 * Orquestrador da tabela de transações.
 *
 * Responsabilidade única: compor cabeçalho + linhas, gerenciar a seleção em
 * massa (checkbox "Selecionar todas" + exclusão) e lidar com estado vazio.
 * Não contém lógica de formatação, cálculo ou estilização de células —
 * isso é delegado a `TransactionTableHeader` e `TransactionTableRow`.
 *
 * Responsivo: a tabela (md+) e a lista de cards (< md) são renderizadas juntas
 * e o CSS mostra só uma delas, sem depender de JS nem causar flash na hidratação.
 */
export function TransactionsTable({
  transactions,
  categories = [],
  clients = [],
  showBulkActions = false,
  scrollable = false,
}: TransactionsTableProps) {
  // "Selecionar todas" é um único toggle (não seleção por linha): quando
  // marcado, todas as transações atualmente carregadas (já filtradas) são
  // consideradas selecionadas.
  const [allSelected, setAllSelected] = useState(false);
  const selectedIds =
    showBulkActions && allSelected ? transactions.map((t) => t.id) : [];

  if (transactions.length === 0) {
    return (
      <div className="border-border bg-card flex min-h-[200px] items-center justify-center rounded-2xl border p-6 shadow-sm">
        <p className="text-muted-foreground text-sm">
          Nenhuma movimentação encontrada para os filtros selecionados.
        </p>
      </div>
    );
  }

  const table = (
    <Table>
      <TransactionTableHeader />
      <TableBody>
        {transactions.map((transaction) => (
          <TransactionTableRow
            key={transaction.id}
            transaction={transaction}
            categories={categories}
            clients={clients}
            selected={allSelected}
          />
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="flex flex-col gap-3">
      {showBulkActions && (
        <BulkActionsBar
          allSelected={allSelected}
          onToggleAll={setAllSelected}
          selectedIds={selectedIds}
          onDeleted={() => setAllSelected(false)}
        />
      )}

      {/* MOBILE: um card por transação */}
      <ul
        className={cn(
          "border-border bg-card divide-border/50 divide-y rounded-2xl border shadow-sm md:hidden",
          scrollable ? "max-h-[70vh] overflow-y-auto" : "overflow-hidden",
        )}
      >
        {transactions.map((transaction) => (
          <TransactionCard
            key={transaction.id}
            transaction={transaction}
            categories={categories}
            clients={clients}
            selected={allSelected}
          />
        ))}
      </ul>

      {/* DESKTOP: tabela completa */}
      <div className="border-border bg-card hidden overflow-hidden rounded-2xl border shadow-sm md:block">
        {scrollable ? (
          // Uma única área de rolagem nos dois eixos: o container interno do
          // <Table> (overflow-x-auto) vira overflow-visible, senão ele seria o
          // ancestral de rolagem do <thead> e o sticky não funcionaria.
          <div className="[&_thead]:bg-card max-h-[600px] overflow-auto [&_[data-slot=table-container]]:overflow-visible [&_thead]:sticky [&_thead]:top-0 [&_thead]:z-10">
            {table}
          </div>
        ) : (
          <ScrollArea className="w-full">{table}</ScrollArea>
        )}
      </div>
    </div>
  );
}
