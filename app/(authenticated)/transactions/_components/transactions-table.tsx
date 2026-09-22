import { ScrollArea } from "@/app/_components/ui/scroll-area";
import { Table, TableBody } from "@/app/_components/ui/table";

import { TransactionRow } from "../_actions/get-transactions";
import { SelectOption } from "../_types";
import { TransactionCard } from "./transaction-card";
import { TransactionTableRow } from "./transaction-row";
import { TransactionTableHeader } from "./transaction-table-header";

interface TransactionsTableProps {
  transactions: TransactionRow[];
  categories?: SelectOption[];
  clients?: SelectOption[];
}

/**
 * Orquestrador da tabela de transações.
 *
 * Responsabilidade única: compor cabeçalho + linhas e lidar com estado vazio.
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
}: TransactionsTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="border-border bg-card flex min-h-[200px] items-center justify-center rounded-2xl border p-6 shadow-sm">
        <p className="text-muted-foreground text-sm">
          Nenhuma movimentação encontrada para os filtros selecionados.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* MOBILE: um card por transação */}
      <ul className="border-border bg-card divide-border/50 divide-y overflow-hidden rounded-2xl border shadow-sm md:hidden">
        {transactions.map((transaction) => (
          <TransactionCard
            key={transaction.id}
            transaction={transaction}
            categories={categories}
            clients={clients}
          />
        ))}
      </ul>

      {/* DESKTOP: tabela completa */}
      <div className="border-border bg-card hidden overflow-hidden rounded-2xl border shadow-sm md:block">
        <ScrollArea className="w-full">
          <Table>
            <TransactionTableHeader />
            <TableBody>
              {transactions.map((transaction) => (
                <TransactionTableRow
                  key={transaction.id}
                  transaction={transaction}
                  categories={categories}
                  clients={clients}
                />
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </>
  );
}
