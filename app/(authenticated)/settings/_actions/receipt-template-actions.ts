"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { ActionResult } from "@/app/_lib/action-result";
import { db } from "@/app/_lib/prisma";
import { ReceiptTemplateContent } from "@/app/_lib/receipt-tokens";
import { resolveUser } from "@/app/_lib/resolve-user";

import {
  ReceiptTemplateInput,
  receiptTemplateSchema,
} from "../receipts/_validations/receipt-template-schema";

// ==========================================
// ACTIONS
// ==========================================

export async function getReceiptTemplate(): Promise<
  ActionResult<ReceiptTemplateContent | null>
> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { success: false, error: "Não autorizado" };

  const user = await resolveUser(clerkId);
  if (!user) return { success: false, error: "Usuário não encontrado" };

  const template = await db.receiptTemplate.findUnique({
    where: { userId: user.id },
  });

  if (!template) {
    return { success: true, data: null };
  }

  return {
    success: true,
    data: {
      logoDataUrl: template.logoDataUrl,
      title: template.title,
      subtitle: template.subtitle,
      bodyText: template.bodyText,
      closingText: template.closingText,
      footerText: template.footerText,
    },
  };
}

export async function saveReceiptTemplate(
  input: ReceiptTemplateInput,
): Promise<ActionResult> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { success: false, error: "Não autorizado" };

  const user = await resolveUser(clerkId);
  if (!user) return { success: false, error: "Usuário não encontrado" };

  const parsed = receiptTemplateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos",
    };
  }

  const { logoDataUrl, title, subtitle, bodyText, closingText, footerText } =
    parsed.data;

  await db.receiptTemplate.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      logoDataUrl,
      title,
      subtitle,
      bodyText,
      closingText,
      footerText,
    },
    update: {
      logoDataUrl,
      title,
      subtitle,
      bodyText,
      closingText,
      footerText,
    },
  });

  revalidatePath("/settings/receipts");

  return { success: true, data: undefined };
}
