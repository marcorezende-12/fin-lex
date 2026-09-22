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

import { UpcomingReport } from "../_actions/get-upcoming-charges";
import { buildUpcomingNarrative } from "./upcoming-report";

function truncate(text: string, maxChars: number): string {
  return text.length > maxChars ? `${text.slice(0, maxChars - 1)}…` : text;
}

const COL = {
  name: MARGIN,
  due: MARGIN + 95,
  inDays: MARGIN + 125,
  value: PAGE_WIDTH - MARGIN,
};

function drawTableHeader(pdf: jsPDF, y: number): number {
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(20);
  pdf.text("Cliente / Movimentação", COL.name, y);
  pdf.text("Vencimento", COL.due, y);
  pdf.text("Em", COL.inDays, y);
  pdf.text("Valor", COL.value, y, { align: "right" });
  y += 3;
  pdf.setDrawColor(200);
  pdf.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  return y + 5;
}

export function buildUpcomingPdf(
  letterhead: Letterhead,
  report: UpcomingReport,
): jsPDF {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  let y = drawLetterhead(pdf, letterhead);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);
  pdf.setTextColor(20);
  pdf.text("Relatório de Próximas Cobranças", MARGIN, y);
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
    buildUpcomingNarrative(report),
    CONTENT_WIDTH,
  );
  y = drawParagraph(pdf, narrativeLines, y, 5);
  y += 8;

  if (report.charges.length === 0) {
    return pdf;
  }

  // TABELA
  y = drawTableHeader(pdf, y);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(40);

  const rowHeight = 7;
  for (const charge of report.charges) {
    if (y > MAX_Y) {
      pdf.addPage();
      y = MARGIN;
      y = drawTableHeader(pdf, y);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(40);
    }
    const label = charge.clientName
      ? `${charge.clientName} — ${charge.name}`
      : charge.name;
    pdf.text(truncate(label, 48), COL.name, y);
    pdf.text(format(charge.dueDate, "dd/MM/yyyy"), COL.due, y);
    pdf.text(
      charge.daysUntilDue === 0 ? "hoje" : `${charge.daysUntilDue}d`,
      COL.inDays,
      y,
    );
    pdf.text(formatCurrency(charge.amountInCents / 100), COL.value, y, {
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
  pdf.text("Total previsto", COL.name, y);
  pdf.text(formatCurrency(report.totalInCents / 100), COL.value, y, {
    align: "right",
  });

  return pdf;
}
