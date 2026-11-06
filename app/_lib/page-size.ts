// Fica fora de page-size-select.tsx ("use client") porque a página roda no
// servidor e precisa chamar parsePageSize — funções exportadas de um módulo
// de cliente não podem ser executadas no servidor.

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
export const DEFAULT_PAGE_SIZE = 20;

/**
 * Lê o `pageSize` da URL, aceitando só os valores oferecidos no seletor —
 * qualquer outro valor (ou ausência) cai no padrão.
 */
export function parsePageSize(value: string | undefined): number {
  const size = Number(value);
  return (PAGE_SIZE_OPTIONS as readonly number[]).includes(size)
    ? size
    : DEFAULT_PAGE_SIZE;
}
