import {
  PaymentMethod,
  TransactionStatus,
  TransactionType,
} from "@prisma/client";
import { differenceInDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Badge } from "@/app/_components/ui/badge";
import { ScrollArea } from "@/app/_components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/_components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/_components/ui/tooltip";
import { formatCurrency } from "@/app/_lib/utils";

import { TransactionRow } from "../_actions/get-transactions";
import { DeleteTransactionButton } from "./delete-transaction-button";
import { EditTransactionDialog } from "./edit-transaction-dialog";
import { TransactionStatusCheckbox } from "./transaction-status-checkbox";

interface SelectOption {
  value: string;
  label: string;
}

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  PIX: "Pix",
  CREDIT_CARD: "Cartão de Crédito",
  DEBIT_CARD: "Cartão de Débito",
  BOLETO: "Boleto",
  BANK_TRANSFER: "Transferência",
  CASH: "Dinheiro",
  INSTALLMENT: "Parcelado",
  OTHER: "Outro",
};

interface TooltipInfo {
  highlight: string;
  highlightClass: string;
  detail: string;
}

function getStatusTooltip(
  status: TransactionStatus,
  dueDate: Date,
  paidAt: Date | null,
): TooltipInfo {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const dueFmt = format(due, "dd/MM/yy");

  if (status === TransactionStatus.OVERDUE) {
    const days = differenceInDays(today, due);
    return {
      highlight: `${days} dia${days !== 1 ? "s" : ""} atrasado`,
      highlightClass: "text-destructive",
      detail: `Data de vencimento: ${dueFmt}`,
    };
  }

  if (status === TransactionStatus.PAID && paidAt) {
    return {
      highlight: `Data de pagamento: ${format(new Date(paidAt), "dd/MM/yy")}`,
      highlightClass: "text-primary",
      detail: `Data de vencimento: ${dueFmt}`,
    };
  }

  // PENDING — a vencer
  const days = differenceInDays(due, today);
  return {
    highlight:
      days === 0
        ? "Vence hoje"
        : `${days} dia${days !== 1 ? "s" : ""} para o vencimento`,
    highlightClass: "text-blue-500",
    detail: `Data de vencimento: ${dueFmt}`,
  };
}

interface StatusBadgeProps {
  status: TransactionStatus;
  dueDate: Date;
  paidAt: Date | null;
}

function StatusBadge({ status, dueDate, paidAt }: StatusBadgeProps) {
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

interface TransactionsTableProps {
  transactions: TransactionRow[];
  categories?: SelectOption[];
  clients?: SelectOption[];
}

export function TransactionsTable({
  transactions,
  categories = [],
  clients = [],
}: TransactionsTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="border-border bg-card flex min-h-[200px] items-center justify-center rounded-2xl border p-6 shadow-sm">
        <p className="text-muted-foreground text-sm">
          Nenhuma movimentação encontrada para os filtros selecionados.
        </p>
      </div>
    );
  }

  return (
    <div className="border-border bg-card overflow-hidden rounded-2xl border shadow-sm">
      <ScrollArea className="w-full">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground w-[40px] pl-6 font-medium">
                Pago
              </TableHead>
              <TableHead className="text-muted-foreground font-medium">
                Nome
              </TableHead>
              <TableHead className="text-muted-foreground font-medium">
                Descrição
              </TableHead>
              <TableHead className="text-muted-foreground font-medium">
                Status
              </TableHead>
              <TableHead className="text-muted-foreground font-medium">
                Vencimento
              </TableHead>
              <TableHead className="text-muted-foreground font-medium">
                Pagamento
              </TableHead>
              <TableHead className="text-muted-foreground font-medium">
                Parcela
              </TableHead>
              <TableHead className="text-muted-foreground font-medium">
                Valor
              </TableHead>
              <TableHead className="pr-6 text-right" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => {
              const isPaid = transaction.status === TransactionStatus.PAID;
              const isExpense = transaction.type === TransactionType.EXPENSE;
              const effectiveStatus = transaction.effectiveStatus;
              const amountFormatted = `${isExpense ? "-" : "+"} ${formatCurrency(transaction.amountInCents / 100)}`;

              const installmentLabel =
                transaction.installmentNumber && transaction.totalInstallments
                  ? `${transaction.installmentNumber}/${transaction.totalInstallments}`
                  : "—";

              return (
                <TableRow
                  key={transaction.id}
                  className="border-border/50 hover:bg-muted/50 transition-colors"
                >
                  {/* CHECKBOX de status */}
                  <TableCell className="pl-6">
                    <TransactionStatusCheckbox
                      transactionId={transaction.id}
                      isPaid={isPaid}
                    />
                  </TableCell>

                  {/* NOME */}
                  <TableCell className="py-4 font-medium">
                    <label
                      htmlFor={`transaction-${transaction.id}`}
                      className="cursor-pointer"
                    >
                      {transaction.name}
                    </label>
                  </TableCell>

                  {/* DESCRIÇÃO */}
                  <TableCell className="text-muted-foreground max-w-[200px] truncate py-4">
                    {transaction.description ?? "—"}
                  </TableCell>

                  {/* STATUS — usa o status efetivo (PENDING vencido → OVERDUE) */}
                  <TableCell className="py-4">
                    <StatusBadge
                      status={effectiveStatus}
                      dueDate={transaction.dueDate}
                      paidAt={transaction.paidAt}
                    />
                  </TableCell>

                  {/* DATA DE VENCIMENTO */}
                  <TableCell className="text-muted-foreground py-4">
                    {format(new Date(transaction.dueDate), "dd/MM/yyyy", {
                      locale: ptBR,
                    })}
                  </TableCell>

                  {/* MÉTODO DE PAGAMENTO */}
                  <TableCell className="text-muted-foreground py-4">
                    {PAYMENT_METHOD_LABELS[transaction.paymentMethod]}
                  </TableCell>

                  {/* PARCELAMENTO */}
                  <TableCell className="text-muted-foreground py-4">
                    {installmentLabel}
                  </TableCell>

                  {/* VALOR */}
                  <TableCell
                    className={`py-4 font-semibold ${
                      isExpense ? "text-destructive" : "text-primary"
                    }`}
                  >
                    {amountFormatted}
                  </TableCell>

                  {/* AÇÕES */}
                  <TableCell className="py-4 pr-6 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <EditTransactionDialog
                        transaction={transaction}
                        categories={categories}
                        clients={clients}
                      />
                      <DeleteTransactionButton
                        transactionId={transaction.id}
                        transactionName={transaction.name}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
