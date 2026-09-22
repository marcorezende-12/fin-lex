/**
 * Tokens disponíveis para uso no template de recibo.
 * Compartilhado entre o editor de template (settings/receipts) e a geração
 * do PDF (transactions), para não duplicar a lista nem a lógica de substituição.
 */
export const RECEIPT_TOKENS = [
  { token: "{user_name}", description: "Nome do advogado(a) responsável" },
  { token: "{amount}", description: "Valor recebido" },
  { token: "{client_cpf}", description: "CPF/CNPJ do cliente" },
  { token: "{description}", description: "Descrição da movimentação" },
  { token: "{actual_installments}", description: "Número da parcela atual" },
  { token: "{total_installments}", description: "Número total de parcelas" },
  { token: "{actual_date}", description: "Data do pagamento" },
] as const;

export type ReceiptTokenMap = Record<string, string>;

/** Substitui tokens no formato {token} pelos valores informados. Tokens sem valor correspondente são mantidos como estão. */
export function replaceReceiptTokens(
  text: string,
  tokens: ReceiptTokenMap,
): string {
  return text.replace(
    /\{(\w+)\}/g,
    (match, key: string) => tokens[key] ?? match,
  );
}

export interface ReceiptTemplateContent {
  logoDataUrl: string | null;
  title: string;
  subtitle: string;
  bodyText: string;
  closingText: string;
  footerText: string | null;
}

/** Template padrão exibido quando o usuário ainda não configurou um recibo próprio. */
export const DEFAULT_RECEIPT_TEMPLATE: ReceiptTemplateContent = {
  logoDataUrl: null,
  title: "[Nome do Escritório]",
  subtitle: "Escritório de Advocacia",
  bodyText:
    "Eu, {user_name}, pessoa jurídica/física de direito privado, declaro para os devidos fins que recebi a importância de R$ {amount}, do(a) cliente inscrito(a) no CPF/CNPJ sob o número {client_cpf}, referente a {description}.\n\nInformamos que já foram pagas {actual_installments} de {total_installments} parcelas, restando as demais para a quitação total do compromisso assumido.",
  closingText: "Por ser verdade, firmo presente.\n\n{actual_date}",
  footerText: "[Endereço do escritório]\n[Telefone] · [E-mail]",
};
