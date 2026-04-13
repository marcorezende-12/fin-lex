import { endOfMonth, startOfMonth } from "date-fns";
import Link from "next/link";

import { Button } from "@/app/_components/ui/button";
import { DatePickerWithRange } from "@/app/_components/ui/date-picker";

import { ChartLineMultiple } from "../charts/_components/line-chart";
import { getTransactions } from "../transactions/_actions/get-transactions";
import { AddTransactionButton } from "../transactions/_components/transaction-dialog";
import { TransactionsTable } from "../transactions/_components/transactions-table";
import { getDashboardSummary } from "./_actions/get-dashboard-summary";
import SummaryCards from "./_components/summary-cards";

interface DashboardPageProps {
  searchParams: Promise<{ from?: string; to?: string }>;
}

const DashboardPage = async ({ searchParams }: DashboardPageProps) => {
  const { from, to } = await searchParams;

  // Usa o mês atual como padrão se não houver filtro de data na URL
  const startDate = from ? new Date(from) : startOfMonth(new Date());
  const endDate = to ? new Date(to) : endOfMonth(new Date());

  const [result, recentResult] = await Promise.all([
    getDashboardSummary(startDate, endDate),
    getTransactions({ from: startDate, to: endDate }),
  ]);

  const recentTransactions = recentResult.success
    ? recentResult.data.slice(0, 8)
    : [];

  return (
    <div className="flex flex-col gap-6">
      {/* 1. CABEÇALHO */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Dashboard</h1>
      </div>
      <div className="flex justify-between">
        <DatePickerWithRange />
        <AddTransactionButton />
      </div>

      {/* 2. DIVISÃO DA TELA: 2/3 (Cards) e 1/3 (Gráfico) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ESQUERDA: Cards de resumo */}
        <div className="h-[400px] lg:col-span-2">
          {result.success ? (
            <SummaryCards summary={result.data} />
          ) : (
            <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
              Não foi possível carregar o resumo financeiro.
            </div>
          )}
        </div>
        <div className="h-[400px]">
          <ChartLineMultiple />
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
        <TransactionsTable transactions={recentTransactions} />
      </div>
    </div>
  );
};

export default DashboardPage;
