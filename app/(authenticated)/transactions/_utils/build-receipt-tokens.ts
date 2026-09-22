import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { ReceiptTokenMap } from "@/app/_lib/receipt-tokens";

import { ReceiptData } from "../_actions/get-receipt-data";

/** Formata o valor sem o símbolo "R$" — o template já o escreve literalmente. */
function formatAmountToken(amountInCents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amountInCents / 100);
}

/** Monta o mapa de tokens de um recibo a partir dos dados reais da transação. */
export function buildReceiptTokens(data: ReceiptData): ReceiptTokenMap {
  return {
    user_name: data.userName,
    amount: formatAmountToken(data.amountInCents),
    client_cpf: data.clientDocument ?? "—",
    description: data.description ?? "—",
    actual_installments: String(data.installmentNumber ?? 1),
    total_installments: String(data.totalInstallments ?? 1),
    actual_date: data.paidAt
      ? format(new Date(data.paidAt), "dd/MM/yyyy", { locale: ptBR })
      : "—",
  };
}

/** Slug simples para nome de arquivo — minúsculas, sem acento, espaços viram hífen. */
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
