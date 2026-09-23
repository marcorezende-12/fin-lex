import { jsPDF } from "jspdf";

/** Dimensões A4 em mm — compartilhadas por todo PDF gerado no app (recibo,
 * relatórios) pra manter layout consistente. */
export const PAGE_WIDTH = 210;
export const PAGE_HEIGHT = 297;
export const MARGIN = 25;
export const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
export const MAX_Y = PAGE_HEIGHT - MARGIN;

/** jsPDF só embute imagens rasterizadas (PNG/JPEG/WEBP) — SVG não é suportado. */
export function detectRasterFormat(
  dataUrl: string,
): "PNG" | "JPEG" | "WEBP" | null {
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
export function drawParagraph(
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

export interface Letterhead {
  logoDataUrl: string | null;
  title: string;
}

/**
 * Desenha o cabeçalho padrão (logo + nome do escritório) no topo da página
 * atual — mesmo "papel timbrado" usado no recibo, reaproveitado nos
 * relatórios pra terem a mesma identidade quando exportados/compartilhados.
 * Retorna o `y` logo abaixo do cabeçalho, pronto pra continuar o conteúdo.
 */
export function drawLetterhead(pdf: jsPDF, letterhead: Letterhead): number {
  let y = MARGIN;

  const logoFormat = letterhead.logoDataUrl
    ? detectRasterFormat(letterhead.logoDataUrl)
    : null;
  if (letterhead.logoDataUrl && logoFormat) {
    try {
      pdf.addImage(letterhead.logoDataUrl, logoFormat, MARGIN, y, 14, 14);
    } catch {
      // Logo corrompido ou em formato inesperado — segue sem logo.
    }
  }

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13);
  pdf.setTextColor(20);
  pdf.text(
    letterhead.title,
    letterhead.logoDataUrl ? MARGIN + 18 : MARGIN,
    y + 6,
  );

  y += 20;
  pdf.setDrawColor(220);
  pdf.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 10;

  return y;
}

type RGB = [number, number, number];

export interface MonthlyBarPoint {
  label: string;
  value: number;
}

/**
 * Gráfico de barras "assinado" (positivo/negativo em torno de uma linha de
 * zero), desenhado com as primitivas do jsPDF — sem depender de rasterizar
 * um <svg> do recharts (ver `detectRasterFormat`: jsPDF só embute
 * PNG/JPEG/WEBP, e capturar o canvas do gráfico esbarra no bloqueio de
 * `resistFingerprinting` de alguns navegadores). Usado pro gráfico de lucro
 * mensal no relatório de resultado do período.
 */
export function drawSignedBarChart(
  pdf: jsPDF,
  points: MonthlyBarPoint[],
  startY: number,
  options?: { height?: number; positiveColor?: RGB; negativeColor?: RGB },
): number {
  const height = options?.height ?? 45;
  const labelSpace = 8;
  const totalHeight = height + labelSpace;

  let y = startY;
  if (y + totalHeight > MAX_Y) {
    pdf.addPage();
    y = MARGIN;
  }

  const chartTop = y;
  const chartBottom = y + height;
  const maxPositive = Math.max(0, ...points.map((p) => p.value));
  const maxNegative = Math.min(0, ...points.map((p) => p.value));
  const range = maxPositive - maxNegative || 1;
  const zeroY = chartBottom - ((0 - maxNegative) / range) * height;

  pdf.setDrawColor(220);
  pdf.setLineWidth(0.2);
  pdf.line(MARGIN, zeroY, PAGE_WIDTH - MARGIN, zeroY);
  if (maxPositive > 0) {
    pdf.line(MARGIN, chartTop, PAGE_WIDTH - MARGIN, chartTop);
  }

  const positiveColor = options?.positiveColor ?? [46, 125, 90];
  const negativeColor = options?.negativeColor ?? [190, 60, 60];
  const slot = CONTENT_WIDTH / points.length;
  const barWidth = Math.min(slot * 0.55, 10);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  points.forEach((point, index) => {
    const barHeight = (Math.abs(point.value) / range) * height;
    const x = MARGIN + index * slot + (slot - barWidth) / 2;

    pdf.setFillColor(...(point.value >= 0 ? positiveColor : negativeColor));
    if (point.value >= 0) {
      pdf.rect(x, zeroY - barHeight, barWidth, barHeight, "F");
    } else {
      pdf.rect(x, zeroY, barWidth, barHeight, "F");
    }

    pdf.setTextColor(110);
    pdf.text(point.label, x + barWidth / 2, chartBottom + 5, {
      align: "center",
    });
  });

  return chartBottom + labelSpace;
}
