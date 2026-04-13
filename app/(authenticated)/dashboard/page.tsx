import { endOfMonth, startOfMonth } from "date-fns";
import Link from "next/link";

import { Button } from "@/app/_components/ui/button";
import { DatePickerWithRange } from "@/app/_components/ui/date-picker";

import { getChartData } from "../charts/_actions/get-chart-data";
import { ChartPreview } from "../charts/_components/chart-preview";
import { getCategories } from "../settings/_actions/category-actions";
import { getClients } from "../settings/_actions/client-actions";
import { getTransactions } from "../transactions/_actions/get-transactions";
import { AddTransactionButtonWrapper } from "../transactions/_components/add-transaction-button-wrapper";
import { TransactionsTable } from "../transactions/_components/transactions-table";
import { getDashboardSummary } from "./_actions/get-dashboard-summary";
import SummaryCards from "./_components/summary-cards";

interface DashboardPageProps {
  searchParams: Promise<{ from?: string; to?: string }>;
}

const DashboardPage = async ({ searchParams }: DashboardPageProps) => {
  const { from, to } = await searchParams;

  const startDate = from ? new Date(from) : startOfMonth(new Date());
  const endDate = to ? new Date(to) : endOfMonth(new Date());

  const [
    summaryResult,
    recentResult,
    chartResult,
    categoriesResult,
    clientsResult,
  ] = await Promise.all([
    getDashboardSummary(startDate, endDate),
    getTransactions({ from: startDate, to: endDate }),
    getChartData(new Date()),
    getCategories(),
    getClients(),
  ]);

  const recentTransactions = recentResult.success
    ? recentResult.data.slice(0, 8)
    : [];
  const chartData = chartResult.success ? chartResult.data : [];
  const categories = categoriesResult.success
    ? categoriesResult.data.map((c) => ({ value: c.id, label: c.name }))
    : [];
  const clients = clientsResult.success
    ? clientsResult.data.map((c) => ({ value: c.id, label: c.name }))
    : [];

  return (
    <div className="flex flex-col gap-6">
      {/* 1. CABEÇALHO */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Dashboard</h1>
      </div>
      <div className="flex justify-between">
        <DatePickerWithRange />
        <AddTransactionButtonWrapper />
      </div>

      {/* 2. CARDS DE RESUMO (2/3) + GRÁFICO PREVIEW (1/3) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="h-[400px] lg:col-span-2">
          {summaryResult.success ? (
            <SummaryCards summary={summaryResult.data} />
          ) : (
            <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
              Não foi possível carregar o resumo financeiro.
            </div>
          )}
        </div>

        <div className="h-[400px]">
          <ChartPreview data={chartData} />
        </div>
      </div>

      {/* 3. TABELA DE MOVIMENTAÇÕES RECENTES */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Movimentações Recentes</h2>
          <Button variant="outline" asChild className="cursor-pointer">
            <Link href="/transactions">Ver mais</Link>
          </Button>
        </div>
        <TransactionsTable
          transactions={recentTransactions}
          categories={categories}
          clients={clients}
        />
      </div>
    </div>
  );
};

export default DashboardPage;
