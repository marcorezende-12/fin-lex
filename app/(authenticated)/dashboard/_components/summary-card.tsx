import { ReactNode } from "react";

interface SummaryCardProps {
  title: string;
  amount: string;
  icon: ReactNode;
  amountColorClass?: string;
  iconWrapperClass?: string;
}

export function SummaryCard({
  title,
  amount,
  icon,
  amountColorClass = "text-foreground",
  iconWrapperClass = "bg-muted",
}: SummaryCardProps) {
  return (
    // Mobile (< sm): card compacto em linha (título à esquerda, valor à direita)
    // para caber os 6 cards sem cortar. Do `sm` em diante, layout original em coluna.
    <div className="bg-card border-border flex h-full min-w-0 flex-row items-center justify-between gap-3 rounded-2xl border p-4 shadow-sm sm:flex-col sm:items-stretch sm:p-6">
      <div className="text-muted-foreground flex min-w-0 items-center gap-2">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${iconWrapperClass}`}
        >
          {icon}
        </div>
        <span className="truncate text-base font-medium">{title}</span>
      </div>
      {/* break-words: o "R$" e o valor vêm unidos por um espaço não-quebrável
          (Intl.NumberFormat pt-BR), então sem isso o valor não quebra linha —
          só transborda o card quando não cabe na largura disponível. */}
      <p
        className={`shrink-0 text-xl font-bold break-words sm:text-3xl ${amountColorClass}`}
      >
        {amount}
      </p>
    </div>
  );
}
