import { PaymentMethod, TransactionType } from "@prisma/client";
import { z } from "zod";

export const transactionSchema = z
  .object({
    name: z.string().min(1, { message: "O nome é obrigatório" }),
    description: z.string().min(1, { message: "A descrição é obrigatória" }),
    amount: z.coerce
      .number()
      .positive({ message: "O valor deve ser positivo" }),
    type: z.nativeEnum(TransactionType, {
      message: "O tipo de transação é obrigatório",
    }),
    categoryId: z.string().optional(),
    clientId: z.string().optional(),
    paymentMethod: z.nativeEnum(PaymentMethod, {
      message: "O método de pagamento é obrigatório",
    }),
    date: z.date({
      message: "A data é obrigatória",
    }),

    // Campo que só será usado se for parcelado
    installments: z.coerce
      .number()
      .int({ message: "O número de parcelas deve ser um número inteiro" })
      .max(360, { message: "O limite máximo é de 360 parcelas" })
      .optional(),
    installmentsData: z
      .array(
        z.object({
          number: z.number(),
          date: z.date(),
          value: z.number(),
        }),
      )
      .optional(),
  })
  .superRefine((data, ctx) => {
    // Se o método de pagamento for "Parcelado"...
    if (data.paymentMethod === PaymentMethod.INSTALLMENT) {
      // ... o número de parcelas passa a ser obrigatório e deve ser maior que 1
      if (!data.installments || data.installments <= 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Informe um número de parcelas válido (mínimo 2)",
          path: ["installments"],
        });
      }
    }
  });

export type TransactionSchema = z.infer<typeof transactionSchema>;
export type TransactionInput = z.input<typeof transactionSchema>;
