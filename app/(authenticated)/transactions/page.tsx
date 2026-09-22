import {
  PaymentMethod,
  TransactionStatus,
  TransactionType,
} from "@/generated/prisma";

import { getCategories } from "../settings/_actions/category-actions";
import { getClients } from "../settings/_actions/client-actions";
import { getTransactions } from "./_actions/get-transactions";
import { AddTransactionButtonWrapper } from "./_components/add-transaction-button-wrapper";
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

  const [result, categoriesResult, clientsResult] = await Promise.all([
    getTransactions({
      search,
      type: type as TransactionType | undefined,
      status: status as TransactionStatus | undefined,
      paymentMethod: paymentMethod as PaymentMethod | undefined,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    }),
    getCategories(),
    getClients(),
  ]);

  const transactions = result.success ? result.data : [];
  const categories = categoriesResult.success
    ? categoriesResult.data.map((c) => ({ value: c.id, label: c.name }))
    : [];
  const clients = clientsResult.success
    ? clientsResult.data.map((c) => ({ value: c.id, label: c.name }))
    : [];

  return (
    <div className="flex flex-col gap-6">
      {/* CABEÇALHO */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Movimentações</h1>
          <p className="text-muted-foreground text-sm">
            {transactions.length}{" "}
            {transactions.length === 1
              ? "movimentação encontrada"
              : "movimentações encontradas"}
          </p>
        </div>
        <AddTransactionButtonWrapper />
      </div>

      {/* FILTROS */}
      <TransactionFilters />

      {/* ERRO DA QUERY */}
      {!result.success && (
        <p className="text-destructive text-sm">{result.error}</p>
      )}

      {/* TABELA */}
      <TransactionsTable
        transactions={transactions}
        categories={categories}
        clients={clients}
      />
    </div>
  );
};

export default TransactionsPage;
