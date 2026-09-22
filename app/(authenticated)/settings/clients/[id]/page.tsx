import { TrendingDownIcon, TrendingUpIcon, WalletIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/app/_components/ui/button";
import { PaginationControls } from "@/app/_components/ui/pagination-controls";
import { formatCurrency } from "@/app/_lib/utils";

import { SummaryCard } from "../../../dashboard/_components/summary-card";
import { getTransactions } from "../../../transactions/_actions/get-transactions";
import { ExportCsvButton } from "../../../transactions/_components/export-csv-button";
import { TransactionsTable } from "../../../transactions/_components/transactions-table";
import { getCategories } from "../../_actions/category-actions";
import {
  getClientDetail,
  getClientSummary,
} from "../../_actions/client-statement-actions";

const PAGE_SIZE = 50;

interface ClientStatementPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}

const ClientStatementPage = async ({
  params,
  searchParams,
}: ClientStatementPageProps) => {
  const { id } = await params;
  const { page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page ?? "1", 10) || 1);

  const [clientResult, summaryResult, categoriesResult] = await Promise.all([
    getClientDetail(id),
    getClientSummary(id),
    getCategories(),
  ]);

  if (!clientResult.success) {
    notFound();
  }

  const client = clientResult.data;
  const filters = { clientId: client.id };

  const transactionsResult = await getTransactions(filters, {
    page: currentPage,
    pageSize: PAGE_SIZE,
  });

  const transactions = transactionsResult.success
    ? transactionsResult.data
    : [];
  const totalPages = transactionsResult.success
    ? transactionsResult.totalPages
    : 1;
  const totalCount = transactionsResult.success
    ? transactionsResult.totalCount
    : 0;
  const categories = categoriesResult.success
    ? categoriesResult.data.map((c) => ({ value: c.id, label: c.name }))
    : [];
  // O extrato já está no contexto de um único cliente — o select de
  // cliente do dialog de edição não precisa listar os outros.
  const clientOptions = [{ value: client.id, label: client.name }];

  return (
    <div className="flex flex-col gap-6">
      {/* CABEÇALHO */}
      <div className="flex flex-col gap-3">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="w-fit cursor-pointer"
        >
          <Link href="/settings/clients">← Voltar para clientes</Link>
        </Button>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold">{client.name}</h1>
            <p className="text-muted-foreground text-sm">
              {[client.email, client.phone, client.document]
                .filter(Boolean)
                .join(" · ") || "Sem dados de contato cadastrados"}
            </p>
          </div>
          <ExportCsvButton filters={filters} />
        </div>
      </div>

      {/* RESUMO FINANCEIRO */}
      {summaryResult.success && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <SummaryCard
            title="Recebido"
            amount={formatCurrency(summaryResult.data.paidIncome)}
            icon={<TrendingUpIcon className="text-primary h-4 w-4" />}
            amountColorClass="text-primary"
            iconWrapperClass="bg-primary/10"
          />
          <SummaryCard
            title="A Receber"
            amount={formatCurrency(summaryResult.data.pendingIncome)}
            icon={<TrendingUpIcon className="h-4 w-4 text-blue-500" />}
            amountColorClass="text-blue-500"
            iconWrapperClass="bg-blue-500/10"
          />
          <SummaryCard
            title="Pago"
            amount={formatCurrency(summaryResult.data.paidExpense)}
            icon={<TrendingDownIcon className="text-destructive h-4 w-4" />}
            amountColorClass="text-destructive"
            iconWrapperClass="bg-destructive/10"
          />
          <SummaryCard
            title="A Pagar"
            amount={formatCurrency(summaryResult.data.pendingExpense)}
            icon={<TrendingDownIcon className="h-4 w-4 text-blue-500" />}
            amountColorClass="text-blue-500"
            iconWrapperClass="bg-blue-500/10"
          />
          <SummaryCard
            title="Saldo"
            amount={formatCurrency(summaryResult.data.balance)}
            icon={<WalletIcon className="h-4 w-4" />}
          />
        </div>
      )}

      {/* HISTÓRICO */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Movimentações</h2>
          <p className="text-muted-foreground text-sm">
            {totalCount} {totalCount === 1 ? "movimentação" : "movimentações"}
          </p>
        </div>

        {!transactionsResult.success && (
          <p className="text-destructive text-sm">{transactionsResult.error}</p>
        )}

        <TransactionsTable
          transactions={transactions}
          categories={categories}
          clients={clientOptions}
        />

        <PaginationControls page={currentPage} totalPages={totalPages} />
      </div>
    </div>
  );
};

export default ClientStatementPage;
