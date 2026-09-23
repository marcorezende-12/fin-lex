import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { formatCurrency } from "@/app/_lib/utils";
import { TransactionStatus, TransactionType } from "@/generated/prisma";

import { TransactionRow as TransactionRowData } from "../_actions/get-transactions";
import { PAYMENT_METHOD_LABELS, SelectOption } from "../_types";
import {
  formatInstallmentLabel,
  getStatusTooltip,
} from "../_utils/transaction";
import { DeleteTransactionButton } from "./delete-transaction-button";
import { DownloadReceiptButton } from "./download-receipt-button";
import { EditTransactionDialog } from "./edit-transaction-dialog";
import { StatusBadge } from "./status-badge";
import { TransactionStatusCheckbox } from "./transaction-status-checkbox";

interface TransactionCardProps {
  transaction: TransactionRowData;
  categories: SelectOption[];
  clients: SelectOption[];
  /** Destaque visual quando a movimentação está incluída na seleção em massa. */
  selected?: boolean;
}

/**
 * Versão mobile (< md) de uma linha da tabela de transações.
 *
 * Mostra os mesmos dados de `TransactionTableRow`, mas empilhados: nome e valor
 * em destaque, detalhes numa linha secundária e ações sempre visíveis (na
 * tabela elas ficam na última coluna, fora da tela em telas pequenas).
 */
export function TransactionCard({
  transaction,
  categories,
  clients,
  selected = false,
}: TransactionCardProps) {
  const isPaid = transaction.status === TransactionStatus.PAID;
  const isExpense = transaction.type === TransactionType.EXPENSE;
  const amountFormatted = `${isExpense ? "-" : "+"} ${formatCurrency(
    transaction.amountInCents / 100,
  )}`;
  const installmentLabel = formatInstallmentLabel(
    transaction.installmentNumber,
    transaction.totalInstallments,
    transaction.recurringPlanId,
  );
  // O tooltip do StatusBadge não abre com toque, então o mesmo texto vai inline.
  const statusInfo = getStatusTooltip(
    transaction.effectiveStatus,
    transaction.dueDate,
    transaction.paidAt,
  );

  return (
    <li className={`flex flex-col gap-3 p-4 ${selected ? "bg-primary/5" : ""}`}>
      <div className="flex items-start gap-3">
        <div className="pt-1">
          <TransactionStatusCheckbox
            transactionId={transaction.id}
            isPaid={isPaid}
            amountInCents={transaction.amountInCents}
            idPrefix="transaction-card"
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{transaction.name}</p>
          <p className="text-muted-foreground truncate text-sm">
            {transaction.description ?? "—"}
          </p>
        </div>

        <p
          className={`shrink-0 font-semibold ${
            isExpense ? "text-destructive" : "text-primary"
          }`}
        >
          {amountFormatted}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <StatusBadge
          status={transaction.effectiveStatus}
          dueDate={transaction.dueDate}
          paidAt={transaction.paidAt}
        />
        <span className={`text-xs font-medium ${statusInfo.highlightClass}`}>
          {statusInfo.highlight}
        </span>
      </div>

      <dl className="text-muted-foreground grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        <div>
          <dt className="sr-only">Vencimento</dt>
          <dd>
            Vence em{" "}
            {format(new Date(transaction.dueDate), "dd/MM/yyyy", {
              locale: ptBR,
            })}
          </dd>
        </div>
        <div>
          <dt className="sr-only">Pagamento</dt>
          <dd>{PAYMENT_METHOD_LABELS[transaction.paymentMethod]}</dd>
        </div>
        {installmentLabel !== "—" && (
          <div>
            <dt className="sr-only">Parcela</dt>
            <dd>Parcela {installmentLabel}</dd>
          </div>
        )}
      </dl>

      <div className="border-border/50 -mb-1 flex items-center justify-end gap-2 border-t pt-2">
        {isPaid && (
          <DownloadReceiptButton
            transactionId={transaction.id}
            transactionName={transaction.name}
          />
        )}
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
    </li>
  );
}
