/**
 * Escapa um valor pra uma célula CSV: envolve em aspas e duplica aspas
 * internas sempre que o valor contém vírgula, aspas ou quebra de linha —
 * regra padrão do formato (RFC 4180), garante que abre certo no Excel/
 * Google Sheets mesmo com nomes/descrições que tenham vírgula.
 */
function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Monta um CSV a partir de uma lista de linhas já formatadas como string[]
 * (cada item = uma célula). `﻿` (BOM) no início faz o Excel reconhecer
 * UTF-8 automaticamente — sem isso, acentos vêm corrompidos ao abrir.
 */
export function buildCsv(headers: string[], rows: string[][]): string {
  const lines = [headers, ...rows].map((row) =>
    row.map(escapeCsvCell).join(","),
  );
  return "﻿" + lines.join("\r\n");
}
