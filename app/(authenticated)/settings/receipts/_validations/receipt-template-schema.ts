import { z } from "zod";

export const receiptTemplateSchema = z.object({
  logoDataUrl: z
    .string()
    .nullable()
    // Restrito aos formatos rasterizados que o jsPDF sabe embutir no PDF do
    // recibo (ver detectRasterFormat em build-receipt-pdf.ts) — um SVG passaria
    // aqui e apareceria no preview, mas seria omitido silenciosamente do PDF.
    .refine(
      (v) => v === null || /^data:image\/(png|jpe?g|webp);base64,/i.test(v),
      {
        message: "Formato de imagem não suportado. Use PNG, JPEG ou WEBP.",
      },
    )
    .refine((v) => v === null || v.length <= 2_000_000, {
      message: "Imagem muito grande, use um arquivo menor que 1MB",
    }),
  title: z
    .string()
    .trim()
    .min(1, "O nome do escritório é obrigatório")
    .max(120, "Máximo de 120 caracteres"),
  subtitle: z.string().trim().max(120, "Máximo de 120 caracteres"),
  bodyText: z
    .string()
    .min(1, "O corpo do recibo é obrigatório")
    .max(4000, "Máximo de 4000 caracteres"),
  closingText: z.string().max(300, "Máximo de 300 caracteres"),
  footerText: z.string().max(1000, "Máximo de 1000 caracteres").nullable(),
});

export type ReceiptTemplateInput = z.infer<typeof receiptTemplateSchema>;
