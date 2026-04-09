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
    <div className="bg-card border-border flex h-full flex-col justify-between rounded-2xl border p-6 shadow-sm">
      <div className="text-muted-foreground flex items-center gap-2">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full ${iconWrapperClass}`}
        >
          {icon}
        </div>
        <span className="text-base font-medium">{title}</span>
      </div>
      <p className={`text-3xl font-bold ${amountColorClass}`}>{amount}</p>
    </div>
  );
}
