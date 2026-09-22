import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { jsPDF } from "jspdf";

import {
  CONTENT_WIDTH,
  drawLetterhead,
  drawParagraph,
  Letterhead,
  MARGIN,
  PAGE_WIDTH,
} from "@/app/_lib/pdf-helpers";
import { formatCurrency } from "@/app/_lib/utils";

import { PeriodResult } from "../_actions/get-period-result";
import { buildPeriodNarrative } from "./period-report";

/** Uma linha "rótulo ....... valor", usada nos blocos de realizado/previsto. */
function drawResultLine(
  pdf: jsPDF,
  label: string,
  valueInCents: number,
  y: number,
  options?: { bold?: boolean; color?: number },
): number {
  pdf.setFont("helvetica", options?.bold ? "bold" : "normal");
  pdf.setFontSize(options?.bold ? 12 : 10);
  pdf.setTextColor(options?.color ?? 40);
  pdf.text(label, MARGIN, y);
  pdf.text(formatCurrency(valueInCents / 100), PAGE_WIDTH - MARGIN, y, {
    align: "right",
  });
  return y + (options?.bold ? 8 : 7);
}

export function buildPeriodPdf(
  letterhead: Letterhead,
  report: PeriodResult,
): jsPDF {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  let y = drawLetterhead(pdf, letterhead);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);
  pdf.setTextColor(20);
  pdf.text(`Resultado do Período — ${report.periodLabel}`, MARGIN, y);
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
    buildPeriodNarrative(report),
    CONTENT_WIDTH,
  );
  y = drawParagraph(pdf, narrativeLines, y, 5);
  y += 10;

  // REALIZADO
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.setTextColor(20);
  pdf.text("Realizado", MARGIN, y);
  y += 3;
  pdf.setDrawColor(220);
  pdf.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 8;

  y = drawResultLine(
    pdf,
    "Entrou (receitas recebidas)",
    report.actualIncome,
    y,
  );
  y = drawResultLine(pdf, "Saiu (despesas pagas)", report.actualExpense, y);
  y += 2;
  y = drawResultLine(
    pdf,
    report.profit >= 0 ? "Lucro" : "Prejuízo",
    report.profit,
    y,
    {
      bold: true,
      color: report.profit >= 0 ? 22 : 180,
    },
  );
  y += 10;

  // PREVISTO
  if (report.expectedIncome > 0 || report.expectedExpense > 0) {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.setTextColor(20);
    pdf.text("Previsto (ainda pendente)", MARGIN, y);
    y += 3;
    pdf.setDrawColor(220);
    pdf.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
    y += 8;

    y = drawResultLine(pdf, "A receber", report.expectedIncome, y);
    y = drawResultLine(pdf, "A pagar", report.expectedExpense, y);
    y += 2;
    y = drawResultLine(pdf, "Resultado previsto", report.expectedProfit, y, {
      bold: true,
    });
  }

  return pdf;
}
