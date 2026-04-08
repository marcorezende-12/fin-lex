import { TrendingDownIcon, TrendingUpIcon, WalletIcon } from "lucide-react";

import { SummaryCard } from "./summary-card";

const SummaryCards = () => {
  return (
    <div className="grid h-full grid-rows-2 gap-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <SummaryCard
          title="Receita Prevista"
          amount="R$ 2.700,00"
          icon={<TrendingUpIcon className="text-primary h-4 w-4" />}
          amountColorClass="text-primary"
          iconWrapperClass="bg-primary/10"
        />
        <SummaryCard
          title="Despesa Prevista"
          amount="R$ 2.700,00"
          icon={<TrendingDownIcon className="text-destructive h-4 w-4" />}
          amountColorClass="text-destructive"
          iconWrapperClass="bg-destructive/10"
        />
        <SummaryCard
          title="Saldo Previsto"
          amount="R$ 2.700,00"
          icon={<WalletIcon className="h-4 w-4 text-blue-500" />}
          amountColorClass="text-blue-500"
          iconWrapperClass="bg-blue-500/10"
        />
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <SummaryCard
          title="Receita Real"
          amount="R$ 8.150,00"
          icon={<TrendingUpIcon className="text-foreground h-4 w-4" />}
          amountColorClass="text-foreground"
          iconWrapperClass="bg-foreground/5"
        />
        <SummaryCard
          title="Despesa Real"
          amount="R$ 2.950,00"
          icon={<TrendingDownIcon className="text-foreground h-4 w-4" />}
          amountColorClass="text-foreground"
          iconWrapperClass="bg-foreground/5"
        />
        <SummaryCard
          title="Saldo Real"
          amount="R$ 2.700,00"
          icon={<WalletIcon className="text-foreground h-4 w-4" />}
          amountColorClass="text-foreground"
          iconWrapperClass="bg-foreground/5"
        />
      </div>
    </div>
  );
};

export default SummaryCards;
