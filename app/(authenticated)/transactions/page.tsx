import {
  PaymentMethod,
  TransactionStatus,
  TransactionType,
} from "@prisma/client";

import { getTransactions } from "./_actions/get-transactions";
import { AddTransactionButton } from "./_components/transaction-dialog";
import { TransactionFilters } from "./_components/transaction-filters";
import { TransactionsTable } from "./_components/transactions-table";

interface TransactionsPageProps {
  searchParams: Promise<{
    search?: string;
    type?: string;
    status?: string;
    paymentMethod?: string;
    from?: string;
    to?: string;
  }>;
}

const TransactionsPage = async ({ searchParams }: TransactionsPageProps) => {
  const { search, type, status, paymentMethod, from, to } = await searchParams;

  const result = await getTransactions({
    search,
    type: type as TransactionType | undefined,
    status: status as TransactionStatus | undefined,
    paymentMethod: paymentMethod as PaymentMethod | undefined,
    from: from ? new Date(from) : undefined,
    to: to ? new Date(to) : undefined,
  });

  const transactions = result.success ? result.data : [];

  return (
    <div className="flex flex-col gap-6">
      {/* CABEÇALHO */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Movimentações</h1>
          <p className="text-muted-foreground text-sm">
            {transactions.length}{" "}
            {transactions.length === 1
              ? "movimentação encontrada"
              : "movimentações encontradas"}
          </p>
        </div>
        <AddTransactionButton />
      </div>

      {/* FILTROS */}
      <TransactionFilters />

      {/* ERRO DA QUERY */}
      {!result.success && (
        <p className="text-destructive text-sm">{result.error}</p>
      )}

      {/* TABELA */}
      <TransactionsTable transactions={transactions} />
    </div>
  );
};

export default TransactionsPage;
