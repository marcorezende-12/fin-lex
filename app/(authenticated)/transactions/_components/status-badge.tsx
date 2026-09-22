import { Badge } from "@/app/_components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/_components/ui/tooltip";
import { TransactionStatus } from "@/generated/prisma";

import { getStatusTooltip } from "../_utils/transaction";

interface StatusBadgeProps {
  status: TransactionStatus;
  dueDate: Date;
  paidAt: Date | null;
}

/**
 * Badge de status de transação com tooltip informativo ao hover.
 *
 * Responsabilidade única: exibir o status visual + contexto no tooltip.
 * Toda lógica de cálculo é delegada a `getStatusTooltip` (utils).
 */
export function StatusBadge({ status, dueDate, paidAt }: StatusBadgeProps) {
  const tooltip = getStatusTooltip(status, dueDate, paidAt);

  const badge = (() => {
    if (status === TransactionStatus.OVERDUE) {
      return (
        <Badge
          variant="ghost"
          className="bg-destructive/10 text-destructive hover:bg-destructive/10 gap-1.5"
        >
          <span className="bg-destructive h-1.5 w-1.5 rounded-full" />
          Atrasado
        </Badge>
      );
    }

    if (status === TransactionStatus.PAID) {
      return (
        <Badge
          variant="ghost"
          className="bg-primary/10 text-primary hover:bg-primary/10 gap-1.5"
        >
          <span className="bg-primary h-1.5 w-1.5 rounded-full" />
          Pago
        </Badge>
      );
    }

    return (
      <Badge
        variant="ghost"
        className="gap-1.5 bg-blue-500/10 text-blue-500 hover:bg-blue-500/10"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />A vencer
      </Badge>
    );
  })();

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-default">{badge}</span>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="border-border bg-card flex flex-col gap-1 rounded-xl border px-3 py-2.5 shadow-md"
        >
          <p className={`text-sm font-semibold ${tooltip.highlightClass}`}>
            {tooltip.highlight}
          </p>
          <p className="text-muted-foreground text-xs">{tooltip.detail}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
