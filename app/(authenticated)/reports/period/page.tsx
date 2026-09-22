import { TrendingDownIcon, TrendingUpIcon, WalletIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/app/_components/ui/button";
import { formatCurrency } from "@/app/_lib/utils";

import { getAvailableChartYears } from "../../charts/_actions/get-chart-data";
import { SummaryCard } from "../../dashboard/_components/summary-card";
import { getPeriodResult, PeriodType } from "../_actions/get-period-result";
import { DownloadPeriodPdfButton } from "../_components/download-period-pdf-button";
import { PeriodResultFilter } from "../_components/period-result-filter";
import { buildPeriodNarrative } from "../_lib/period-report";

interface PeriodReportPageProps {
  searchParams: Promise<{ period?: string; year?: string; month?: string }>;
}

const PeriodReportPage = async ({ searchParams }: PeriodReportPageProps) => {
  const { period, year, month } = await searchParams;

  const periodType: PeriodType = period === "year" ? "year" : "month";
  const currentYear = new Date().getFullYear();
  const selectedYear = year ? parseInt(year, 10) : currentYear;
  const parsedMonth = month ? parseInt(month, 10) : new Date().getMonth() + 1;
  const selectedMonth = parsedMonth >= 1 && parsedMonth <= 12 ? parsedMonth : 1;

  const [result, yearsResult] = await Promise.all([
    getPeriodResult(periodType, selectedYear, selectedMonth),
    getAvailableChartYears(),
  ]);
  const availableYears = yearsResult.success ? yearsResult.data : [currentYear];

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
          <Link href="/reports">← Voltar para relatórios</Link>
        </Button>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold">Resultado do Período</h1>
            <p className="text-muted-foreground text-sm">
              Entradas, saídas e lucro de um mês ou ano específico
            </p>
          </div>
          {result.success && <DownloadPeriodPdfButton report={result.data} />}
        </div>
      </div>

      {/* FILTRO */}
      <PeriodResultFilter
        period={periodType}
        year={selectedYear}
        month={selectedMonth}
        availableYears={availableYears}
      />

      {!result.success ? (
        <p className="text-destructive text-sm">{result.error}</p>
      ) : (
        <>
          {/* NARRATIVA */}
          <div className="border-border bg-card rounded-2xl border p-4 shadow-sm">
            <p className="text-sm leading-relaxed">
              {buildPeriodNarrative(result.data)}
            </p>
          </div>

          {/* REALIZADO */}
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-bold">Realizado</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <SummaryCard
                title="Entrou"
                amount={formatCurrency(result.data.actualIncome / 100)}
                icon={<TrendingUpIcon className="text-primary h-4 w-4" />}
                amountColorClass="text-primary"
                iconWrapperClass="bg-primary/10"
              />
              <SummaryCard
                title="Saiu"
                amount={formatCurrency(result.data.actualExpense / 100)}
                icon={<TrendingDownIcon className="text-destructive h-4 w-4" />}
                amountColorClass="text-destructive"
                iconWrapperClass="bg-destructive/10"
              />
              <SummaryCard
                title={result.data.profit >= 0 ? "Lucro" : "Prejuízo"}
                amount={formatCurrency(Math.abs(result.data.profit) / 100)}
                icon={<WalletIcon className="h-4 w-4 text-blue-500" />}
                amountColorClass="text-blue-500"
                iconWrapperClass="bg-blue-500/10"
              />
            </div>
          </div>

          {/* PREVISTO */}
          {(result.data.expectedIncome > 0 ||
            result.data.expectedExpense > 0) && (
            <div className="flex flex-col gap-3">
              <h2 className="text-lg font-bold">Previsto (ainda pendente)</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <SummaryCard
                  title="A Receber"
                  amount={formatCurrency(result.data.expectedIncome / 100)}
                  icon={<TrendingUpIcon className="text-foreground h-4 w-4" />}
                  iconWrapperClass="bg-foreground/5"
                />
                <SummaryCard
                  title="A Pagar"
                  amount={formatCurrency(result.data.expectedExpense / 100)}
                  icon={
                    <TrendingDownIcon className="text-foreground h-4 w-4" />
                  }
                  iconWrapperClass="bg-foreground/5"
                />
                <SummaryCard
                  title="Resultado Previsto"
                  amount={formatCurrency(
                    Math.abs(result.data.expectedProfit) / 100,
                  )}
                  icon={<WalletIcon className="text-foreground h-4 w-4" />}
                  iconWrapperClass="bg-foreground/5"
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PeriodReportPage;
