import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { TableCell, TableRow } from "@/app/_components/ui/table";
import { formatCurrency } from "@/app/_lib/utils";
import { TransactionStatus, TransactionType } from "@/generated/prisma";

import { TransactionRow as TransactionRowData } from "../_actions/get-transactions";
import { PAYMENT_METHOD_LABELS, SelectOption } from "../_types";
import { formatInstallmentLabel } from "../_utils/transaction";
import { DeleteTransactionButton } from "./delete-transaction-button";
import { DownloadReceiptButton } from "./download-receipt-button";
import { EditTransactionDialog } from "./edit-transaction-dialog";
import { StatusBadge } from "./status-badge";
import { TransactionStatusCheckbox } from "./transaction-status-checkbox";

interface TransactionRowProps {
  transaction: TransactionRowData;
  categories: SelectOption[];
  clients: SelectOption[];
}

/**
 * Linha individual da tabela de transações.
 *
 * Responsabilidade única: renderizar os dados de uma transação.
 * Recebe os dados já processados via props — sem lógica de busca.
 */
export function TransactionTableRow({
  transaction,
  categories,
  clients,
}: TransactionRowProps) {
  const isPaid = transaction.status === TransactionStatus.PAID;
  const isExpense = transaction.type === TransactionType.EXPENSE;
  const amountFormatted = `${isExpense ? "-" : "+"} ${formatCurrency(
    transaction.amountInCents / 100,
  )}`;
  const installmentLabel = formatInstallmentLabel(
    transaction.installmentNumber,
    transaction.totalInstallments,
  );

  return (
    <TableRow className="border-border/50 hover:bg-muted/50 transition-colors">
      {/* CHECKBOX */}
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

      {/* STATUS */}
      <TableCell className="py-4">
        <StatusBadge
          status={transaction.effectiveStatus}
          dueDate={transaction.dueDate}
          paidAt={transaction.paidAt}
        />
      </TableCell>

      {/* DATA DE VENCIMENTO */}
      <TableCell className="text-muted-foreground py-4">
        {format(new Date(transaction.dueDate), "dd/MM/yyyy", { locale: ptBR })}
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
      </TableCell>
    </TableRow>
  );
}
