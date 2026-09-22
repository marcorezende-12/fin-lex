import {
  PaymentMethod,
  TransactionStatus,
  TransactionType,
} from "@/generated/prisma";

/** Par valor/label genérico para selects do formulário. */
export interface SelectOption {
  value: string;
  label: string;
}

/** Mapeamento de método de pagamento para label legível. */
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  PIX: "Pix",
  CREDIT_CARD: "Cartão de Crédito",
  DEBIT_CARD: "Cartão de Débito",
  BOLETO: "Boleto",
  BANK_TRANSFER: "Transferência",
  CASH: "Dinheiro",
  INSTALLMENT: "Parcelado",
  RECURRING: "Recorrente",
  OTHER: "Outro",
};

/** Opções de tipo de transação para filtros e selects. */
export const TYPE_OPTIONS: { value: TransactionType; label: string }[] = [
  { value: TransactionType.INCOME, label: "Receita" },
  { value: TransactionType.EXPENSE, label: "Despesa" },
];

/** Opções de status para filtros. */
export const STATUS_OPTIONS: { value: TransactionStatus; label: string }[] = [
  { value: TransactionStatus.PENDING, label: "Pendente" },
  { value: TransactionStatus.PAID, label: "Pago" },
  { value: TransactionStatus.OVERDUE, label: "Atrasado" },
];

/** Opções de método de pagamento para filtros e selects. */
export const PAYMENT_METHOD_OPTIONS: { value: PaymentMethod; label: string }[] =
  [
    { value: PaymentMethod.PIX, label: "Pix" },
    { value: PaymentMethod.CREDIT_CARD, label: "Cartão de Crédito" },
    { value: PaymentMethod.DEBIT_CARD, label: "Cartão de Débito" },
    { value: PaymentMethod.BOLETO, label: "Boleto" },
    { value: PaymentMethod.BANK_TRANSFER, label: "Transferência" },
    { value: PaymentMethod.CASH, label: "Dinheiro" },
    { value: PaymentMethod.INSTALLMENT, label: "Parcelado" },
    { value: PaymentMethod.RECURRING, label: "Recorrente" },
    { value: PaymentMethod.OTHER, label: "Outro" },
  ];
