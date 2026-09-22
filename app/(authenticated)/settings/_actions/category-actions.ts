"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { ActionResult } from "@/app/_lib/action-result";
import { db } from "@/app/_lib/prisma";
import { resolveUser } from "@/app/_lib/resolve-user";

// ==========================================
// SCHEMAS
// ==========================================

const categorySchema = z.object({
  name: z
    .string()
    .min(1, "O nome é obrigatório")
    .max(50, "Máximo de 50 caracteres"),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Cor inválida")
    .optional(),
});

// ==========================================
// TYPES
// ==========================================

export interface CategoryRow {
  id: string;
  name: string;
  color: string | null;
  transactionCount: number;
}

// ==========================================
// ACTIONS
// ==========================================

export async function getCategories(): Promise<ActionResult<CategoryRow[]>> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { success: false, error: "Não autorizado" };

  const user = await resolveUser(clerkId);
  if (!user) return { success: false, error: "Usuário não encontrado" };

  const categories = await db.category.findMany({
    where: { userId: user.id, deletedAt: null },
    select: {
      id: true,
      name: true,
      color: true,
      _count: { select: { transactions: true } },
    },
    orderBy: { name: "asc" },
  });

  return {
    success: true,
    data: categories.map((c) => ({
      id: c.id,
      name: c.name,
      color: c.color,
      transactionCount: c._count.transactions,
    })),
  };
}

export async function createCategory(
  formData: FormData,
): Promise<ActionResult> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { success: false, error: "Não autorizado" };

  const user = await resolveUser(clerkId);
  if (!user) return { success: false, error: "Usuário não encontrado" };

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    color: formData.get("color") || undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos",
    };
  }

  const { name, color } = parsed.data;

  const existing = await db.category.findFirst({
    where: { userId: user.id, name, deletedAt: null },
  });

  if (existing) {
    return { success: false, error: "Já existe uma categoria com esse nome" };
  }

  try {
    await db.category.create({
      data: { userId: user.id, name, color: color ?? null },
    });
  } catch (err) {
    console.error("[createCategory] Erro ao salvar categoria:", err);
    return { success: false, error: "Erro interno ao salvar a categoria" };
  }

  revalidatePath("/settings");

  return { success: true, data: undefined };
}

export async function updateCategory(
  categoryId: string,
  formData: FormData,
): Promise<ActionResult> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { success: false, error: "Não autorizado" };

  const user = await resolveUser(clerkId);
  if (!user) return { success: false, error: "Usuário não encontrado" };

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    color: formData.get("color") || undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos",
    };
  }

  const { name, color } = parsed.data;

  const category = await db.category.findFirst({
    where: { id: categoryId, userId: user.id, deletedAt: null },
    select: { id: true },
  });

  if (!category) return { success: false, error: "Categoria não encontrada" };

  // Verifica duplicidade de nome excluindo a própria categoria
  const duplicate = await db.category.findFirst({
    where: { userId: user.id, name, deletedAt: null, NOT: { id: categoryId } },
  });

  if (duplicate) {
    return { success: false, error: "Já existe uma categoria com esse nome" };
  }

  try {
    await db.category.update({
      where: { id: category.id },
      data: { name, color: color ?? null },
    });
  } catch (err) {
    console.error("[updateCategory] Erro ao salvar categoria:", err);
    return { success: false, error: "Erro interno ao salvar a categoria" };
  }

  revalidatePath("/settings");

  return { success: true, data: undefined };
}

export async function deleteCategory(
  categoryId: string,
): Promise<ActionResult> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { success: false, error: "Não autorizado" };

  const user = await resolveUser(clerkId);
  if (!user) return { success: false, error: "Usuário não encontrado" };

  const category = await db.category.findFirst({
    where: { id: categoryId, userId: user.id, deletedAt: null },
    select: { id: true },
  });

  if (!category) return { success: false, error: "Categoria não encontrada" };

  // Soft delete
  await db.category.update({
    where: { id: category.id },
    data: { deletedAt: new Date() },
  });

  revalidatePath("/settings");

  return { success: true, data: undefined };
}
