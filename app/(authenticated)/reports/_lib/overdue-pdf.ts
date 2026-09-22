import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { jsPDF } from "jspdf";

import {
  CONTENT_WIDTH,
  drawLetterhead,
  drawParagraph,
  Letterhead,
  MARGIN,
  MAX_Y,
  PAGE_WIDTH,
} from "@/app/_lib/pdf-helpers";
import { formatCurrency } from "@/app/_lib/utils";

import { OverdueReport } from "../_actions/get-overdue-clients";
import { buildOverdueNarrative } from "./overdue-report";

/** Corta o texto em vez de deixar o jsPDF quebrar linha — mantém a altura
 * da linha da tabela previsível. */
function truncate(text: string, maxChars: number): string {
  return text.length > maxChars ? `${text.slice(0, maxChars - 1)}…` : text;
}

const COL = {
  client: MARGIN,
  count: MARGIN + 95,
  days: MARGIN + 125,
  value: PAGE_WIDTH - MARGIN,
};

function drawTableHeader(pdf: jsPDF, y: number): number {
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(20);
  pdf.text("Cliente", COL.client, y);
  pdf.text("Cobranças", COL.count, y);
  pdf.text("Atraso", COL.days, y);
  pdf.text("Valor em aberto", COL.value, y, { align: "right" });
  y += 3;
  pdf.setDrawColor(200);
  pdf.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  return y + 5;
}

export function buildOverduePdf(
  letterhead: Letterhead,
  report: OverdueReport,
): jsPDF {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  let y = drawLetterhead(pdf, letterhead);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);
  pdf.setTextColor(20);
  pdf.text("Relatório de Inadimplência", MARGIN, y);
  y += 6;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(120);
  pdf.text(
    `Gerado em ${format(report.generatedAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`,
    MARGIN,
    y,
  );
  y += 10;

  // NARRATIVA
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(40);
  const narrativeLines = pdf.splitTextToSize(
    buildOverdueNarrative(report),
    CONTENT_WIDTH,
  );
  y = drawParagraph(pdf, narrativeLines, y, 5);
  y += 8;

  if (report.clients.length === 0) {
    return pdf;
  }

  // TABELA
  y = drawTableHeader(pdf, y);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(40);

  const rowHeight = 7;
  for (const row of report.clients) {
    if (y > MAX_Y) {
      pdf.addPage();
      y = MARGIN;
      y = drawTableHeader(pdf, y);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(40);
    }
    pdf.text(truncate(row.clientName, 45), COL.client, y);
    pdf.text(String(row.transactionCount), COL.count, y);
    pdf.text(`${row.daysOverdue}d`, COL.days, y);
    pdf.text(formatCurrency(row.totalOverdueInCents / 100), COL.value, y, {
      align: "right",
    });
    y += rowHeight;
  }

  // TOTAL
  y += 2;
  pdf.setDrawColor(200);
  pdf.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 7;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(20);
  pdf.text("Total em atraso", COL.client, y);
  pdf.text(formatCurrency(report.totalOverdueInCents / 100), COL.value, y, {
    align: "right",
  });

  return pdf;
}
