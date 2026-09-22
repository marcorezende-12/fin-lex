import { jsPDF } from "jspdf";

import {
  ReceiptTemplateContent,
  ReceiptTokenMap,
  replaceReceiptTokens,
} from "@/app/_lib/receipt-tokens";

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 25;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const MAX_Y = PAGE_HEIGHT - MARGIN;

/** jsPDF só embute imagens rasterizadas (PNG/JPEG/WEBP) — SVG não é suportado. */
function detectRasterFormat(dataUrl: string): "PNG" | "JPEG" | "WEBP" | null {
  const match = /^data:image\/(png|jpe?g|webp)/i.exec(dataUrl);
  if (!match) return null;
  const type = match[1].toLowerCase();
  if (type === "webp") return "WEBP";
  return type === "png" ? "PNG" : "JPEG";
}

/**
 * Desenha um parágrafo já quebrado em linhas, pulando de página quando
 * ultrapassa MAX_Y. Retorna o novo `y` após o parágrafo.
 */
function drawParagraph(
  pdf: jsPDF,
  lines: string[],
  startY: number,
  lineHeight: number,
): number {
  let y = startY;
  for (const line of lines) {
    if (y > MAX_Y) {
      pdf.addPage();
      y = MARGIN;
    }
    pdf.text(line, MARGIN, y);
    y += lineHeight;
  }
  return y;
}

/**
 * Gera o PDF do recibo desenhando texto e formas diretamente com jsPDF,
 * sem tirar "print" da tela (html2canvas). Evita depender de canvas
 * readback, que navegadores com proteções de privacidade (ex: Firefox com
 * resistFingerprinting) podem bloquear silenciosamente, retornando uma
 * imagem em branco sem lançar erro.
 */
export function buildReceiptPdf(
  template: ReceiptTemplateContent,
  tokens: ReceiptTokenMap,
): jsPDF {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  let y = MARGIN;

  // LOGO
  const logoFormat = template.logoDataUrl
    ? detectRasterFormat(template.logoDataUrl)
    : null;
  if (template.logoDataUrl && logoFormat) {
    try {
      pdf.addImage(template.logoDataUrl, logoFormat, MARGIN, y, 16, 16);
    } catch {
      // Logo corrompido ou em formato inesperado — segue sem logo.
    }
  }
  y += 24;

  // CABEÇALHO
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.setTextColor(20);
  pdf.text(template.title, PAGE_WIDTH / 2, y, { align: "center" });
  y += 7;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(120);
  pdf.text(template.subtitle, PAGE_WIDTH / 2, y, { align: "center" });
  y += 6;

  pdf.setDrawColor(220);
  pdf.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 12;

  // CORPO
  const bodyLineHeight = 5.5;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  pdf.setTextColor(20);
  const bodyLines: string[] = pdf.splitTextToSize(
    replaceReceiptTokens(template.bodyText, tokens),
    CONTENT_WIDTH,
  );
  y = drawParagraph(pdf, bodyLines, y, bodyLineHeight);
  y += bodyLineHeight;

  // FECHAMENTO
  const closingLines: string[] = pdf.splitTextToSize(
    replaceReceiptTokens(template.closingText, tokens),
    CONTENT_WIDTH,
  );
  y = drawParagraph(pdf, closingLines, y, bodyLineHeight);
  y += 20;

  // ASSINATURA
  if (y > MAX_Y) {
    pdf.addPage();
    y = MARGIN + 20;
  }
  const signatureWidth = 70;
  const signatureX = PAGE_WIDTH / 2 - signatureWidth / 2;
  pdf.setDrawColor(180);
  pdf.line(signatureX, y, signatureX + signatureWidth, y);
  y += 5;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(20);
  pdf.text(tokens.user_name ?? "", PAGE_WIDTH / 2, y, { align: "center" });

  // RODAPÉ — fixo na base da última página gerada
  if (template.footerText) {
    const footerLines: string[] = pdf.splitTextToSize(
      template.footerText,
      CONTENT_WIDTH,
    );
    const footerLineHeight = 4;
    const footerY =
      PAGE_HEIGHT - MARGIN - (footerLines.length - 1) * footerLineHeight;

    pdf.setDrawColor(220);
    pdf.line(MARGIN, footerY - 6, PAGE_WIDTH - MARGIN, footerY - 6);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(140);
    footerLines.forEach((line, index) => {
      pdf.text(line, PAGE_WIDTH / 2, footerY + index * footerLineHeight, {
        align: "center",
      });
    });
  }

  return pdf;
}
