import { z } from "zod";

import { PaymentMethod, TransactionType } from "@/generated/prisma";

// Schema base sem as regras de "parcelamento/recorrência configurados" —
// usado tanto pela criação (com o superRefine abaixo) quanto pela edição
// (sem ele, ver updateTransactionSchema): editar uma transação não mexe em
// parcelamento nem recorrência (cada um tem fluxo próprio), então não faz
// sentido reexigir esses campos toda vez que o usuário só troca a data ou
// o valor de uma transação que já é parcelada/recorrente.
const transactionBaseSchema = z.object({
  name: z.string().min(1, { message: "O nome é obrigatório" }),
  description: z.string().min(1, { message: "A descrição é obrigatória" }),
  amount: z.coerce.number().positive({ message: "O valor deve ser positivo" }),
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

  // Campos que só serão usados se for recorrente. `recurringConfigured`
  // força o usuário a passar pelo dialog de recorrência pelo menos uma
  // vez (mesmo que só pra confirmar "sem término"), espelhando a
  // exigência de configurar o número de parcelas no parcelamento.
  recurringConfigured: z.boolean().optional(),
  recurringEndDate: z.date().nullable().optional(),
});

/** Usado na criação — exige parcelamento/recorrência configurados quando aplicável. */
export const transactionSchema = transactionBaseSchema.superRefine(
  (data, ctx) => {
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

    // Se o método de pagamento for "Recorrente"...
    if (data.paymentMethod === PaymentMethod.RECURRING) {
      // ... é preciso ter passado pelo dialog de configuração
      if (!data.recurringConfigured) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Configure a recorrência antes de continuar",
          path: ["recurringConfigured"],
        });
      }
    }
  },
);

/**
 * Usado na edição (updateTransaction) — sem o superRefine acima, já que
 * editar nunca altera parcelamento nem recorrência (o próprio action não
 * grava installments/recurringConfigured no banco).
 */
export const updateTransactionSchema = transactionBaseSchema;

export type TransactionSchema = z.infer<typeof transactionSchema>;
export type TransactionInput = z.input<typeof transactionSchema>;
