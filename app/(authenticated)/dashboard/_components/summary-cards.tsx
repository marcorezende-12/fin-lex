import { TrendingDownIcon, TrendingUpIcon, WalletIcon } from "lucide-react";

import { formatCurrency } from "@/app/_lib/utils";

import { DashboardSummary } from "../_actions/get-dashboard-summary";
import { SummaryCard } from "./summary-card";

interface SummaryCardsProps {
  summary: DashboardSummary;
}

// Os valores vêm em centavos do banco; divide por 100 para exibir em reais
const toCurrency = (amountInCents: number) =>
  formatCurrency(amountInCents / 100);

const SummaryCards = ({ summary }: SummaryCardsProps) => {
  const {
    expectedIncome,
    expectedExpense,
    expectedBalance,
    actualIncome,
    actualExpense,
    actualBalance,
  } = summary;

  return (
    <div className="grid gap-3 sm:h-[400px] sm:grid-rows-2 sm:gap-6 sm:overflow-hidden">
      {/* Linha 1: Previstos (status PENDING) */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-6">
        <SummaryCard
          title="Receita Prevista"
          amount={toCurrency(expectedIncome)}
          icon={<TrendingUpIcon className="text-primary h-4 w-4" />}
          amountColorClass="text-primary"
          iconWrapperClass="bg-primary/10"
        />
        <SummaryCard
          title="Despesa Prevista"
          amount={toCurrency(expectedExpense)}
          icon={<TrendingDownIcon className="text-destructive h-4 w-4" />}
          amountColorClass="text-destructive"
          iconWrapperClass="bg-destructive/10"
        />
        <SummaryCard
          title="Saldo Previsto"
          amount={toCurrency(expectedBalance)}
          icon={<WalletIcon className="h-4 w-4 text-blue-500" />}
          amountColorClass="text-blue-500"
          iconWrapperClass="bg-blue-500/10"
        />
      </div>

      {/* Linha 2: Realizados (status PAID) */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-6">
        <SummaryCard
          title="Receita Real"
          amount={toCurrency(actualIncome)}
          icon={<TrendingUpIcon className="text-foreground h-4 w-4" />}
          amountColorClass="text-foreground"
          iconWrapperClass="bg-foreground/5"
        />
        <SummaryCard
          title="Despesa Real"
          amount={toCurrency(actualExpense)}
          icon={<TrendingDownIcon className="text-foreground h-4 w-4" />}
          amountColorClass="text-foreground"
          iconWrapperClass="bg-foreground/5"
        />
        <SummaryCard
          title="Saldo Real"
          amount={toCurrency(actualBalance)}
          icon={<WalletIcon className="text-foreground h-4 w-4" />}
          amountColorClass="text-foreground"
          iconWrapperClass="bg-foreground/5"
        />
      </div>
    </div>
  );
};

export default SummaryCards;
