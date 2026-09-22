import { PaginationControls } from "@/app/_components/ui/pagination-controls";
import {
  PaymentMethod,
  TransactionStatus,
  TransactionType,
} from "@/generated/prisma";

import { getCategories } from "../settings/_actions/category-actions";
import { getClients } from "../settings/_actions/client-actions";
import { getTransactions } from "./_actions/get-transactions";
import { AddTransactionButtonWrapper } from "./_components/add-transaction-button-wrapper";
import { ExportCsvButton } from "./_components/export-csv-button";
import { TransactionFilters } from "./_components/transaction-filters";
import { TransactionsTable } from "./_components/transactions-table";

const PAGE_SIZE = 50;

interface TransactionsPageProps {
  searchParams: Promise<{
    search?: string;
    type?: string;
    status?: string;
    paymentMethod?: string;
    from?: string;
    to?: string;
    page?: string;
  }>;
}

const TransactionsPage = async ({ searchParams }: TransactionsPageProps) => {
  const { search, type, status, paymentMethod, from, to, page } =
    await searchParams;

  const filters = {
    search,
    type: type as TransactionType | undefined,
    status: status as TransactionStatus | undefined,
    paymentMethod: paymentMethod as PaymentMethod | undefined,
    from: from ? new Date(from) : undefined,
    to: to ? new Date(to) : undefined,
  };
  const currentPage = Math.max(1, parseInt(page ?? "1", 10) || 1);

  const [result, categoriesResult, clientsResult] = await Promise.all([
    getTransactions(filters, { page: currentPage, pageSize: PAGE_SIZE }),
    getCategories(),
    getClients(),
  ]);

  const transactions = result.success ? result.data : [];
  const totalCount = result.success ? result.totalCount : 0;
  const totalPages = result.success ? result.totalPages : 1;
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
            {totalCount}{" "}
            {totalCount === 1
              ? "movimentação encontrada"
              : "movimentações encontradas"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportCsvButton filters={filters} />
          <AddTransactionButtonWrapper />
        </div>
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
        showBulkActions
      />

      {/* PAGINAÇÃO */}
      <PaginationControls page={currentPage} totalPages={totalPages} />
    </div>
  );
};

export default TransactionsPage;
