"use server";

import { auth } from "@clerk/nextjs/server";
import { TransactionStatus } from "@prisma/client";

import { ActionResult } from "@/app/_lib/action-result";
import { db } from "@/app/_lib/prisma";
import { ReceiptTemplateContent } from "@/app/_lib/receipt-tokens";

export interface ReceiptData {
  transactionName: string;
  description: string | null;
  amountInCents: number;
  installmentNumber: number | null;
  totalInstallments: number | null;
  paidAt: Date | null;
  userName: string;
  clientName: string | null;
  clientDocument: string | null;
  template: ReceiptTemplateContent | null;
}

/**
 * Busca os dados necessários para gerar o recibo de uma transação paga.
 * O filtro `status: PAID` na query também funciona como guarda de autorização:
 * não é possível gerar recibo de uma transação que não esteja paga.
 */
export async function getReceiptData(
  transactionId: string,
): Promise<ActionResult<ReceiptData>> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { success: false, error: "Não autorizado" };

  const user = await db.user.findUnique({
    where: { clerkId },
    select: { id: true, name: true },
  });
  if (!user) return { success: false, error: "Usuário não encontrado" };

  const [transaction, template] = await Promise.all([
    db.transaction.findFirst({
      where: {
        id: transactionId,
        userId: user.id,
        deletedAt: null,
        status: TransactionStatus.PAID,
      },
      select: {
        name: true,
        description: true,
        amountInCents: true,
        installmentNumber: true,
        totalInstallments: true,
        paidAt: true,
        client: { select: { name: true, document: true } },
      },
    }),
    db.receiptTemplate.findUnique({ where: { userId: user.id } }),
  ]);

  if (!transaction) {
    return {
      success: false,
      error: "Transação não encontrada ou não está paga",
    };
  }

  return {
    success: true,
    data: {
      transactionName: transaction.name,
      description: transaction.description,
      amountInCents: transaction.amountInCents,
      installmentNumber: transaction.installmentNumber,
      totalInstallments: transaction.totalInstallments,
      paidAt: transaction.paidAt,
      userName: user.name,
      clientName: transaction.client?.name ?? null,
      clientDocument: transaction.client?.document ?? null,
      template: template
        ? {
            logoDataUrl: template.logoDataUrl,
            title: template.title,
            subtitle: template.subtitle,
            bodyText: template.bodyText,
            closingText: template.closingText,
            footerText: template.footerText,
          }
        : null,
    },
  };
}
