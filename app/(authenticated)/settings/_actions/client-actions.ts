"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { ActionResult } from "@/app/_lib/action-result";
import {
  isValidCnpj,
  isValidCpf,
  onlyDigits,
} from "@/app/_lib/document-validation";
import { db } from "@/app/_lib/prisma";
import { resolveUser } from "@/app/_lib/resolve-user";

// ==========================================
// SCHEMAS
// ==========================================

const clientSchema = z.object({
  name: z
    .string()
    .min(1, "O nome é obrigatório")
    .max(120, "Máximo de 120 caracteres"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  phone: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((val) => {
      if (!val || val.trim() === "") return true;
      const digits = onlyDigits(val);
      return digits.length === 10 || digits.length === 11;
    }, "Telefone inválido. Use o formato (XX) XXXXX-XXXX"),
  document: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((val) => {
      if (!val || val.trim() === "") return true;
      const digits = onlyDigits(val);
      if (digits.length === 11) return isValidCpf(digits);
      if (digits.length === 14) return isValidCnpj(digits);
      return false;
    }, "CPF ou CNPJ inválido"),
  notes: z
    .string()
    .max(500, "Máximo de 500 caracteres")
    .optional()
    .or(z.literal("")),
});

// ==========================================
// TYPES
// ==========================================

export interface ClientRow {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  document: string | null;
  notes: string | null;
  transactionCount: number;
  createdAt: Date;
}

export type ClientInput = z.input<typeof clientSchema>;

// ==========================================
// HELPERS
// ==========================================

function nullIfEmpty(value: string | undefined | null): string | null {
  if (!value || value.trim() === "") return null;
  return value.trim();
}

// ==========================================
// ACTIONS
// ==========================================

export async function getClients(): Promise<ActionResult<ClientRow[]>> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { success: false, error: "Não autorizado" };

  const user = await resolveUser(clerkId);
  if (!user) return { success: false, error: "Usuário não encontrado" };

  const clients = await db.client.findMany({
    where: { userId: user.id, deletedAt: null },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      document: true,
      notes: true,
      createdAt: true,
      _count: { select: { transactions: true } },
    },
    orderBy: { name: "asc" },
  });

  return {
    success: true,
    data: clients.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      document: c.document,
      notes: c.notes,
      createdAt: c.createdAt,
      transactionCount: c._count.transactions,
    })),
  };
}

export async function createClient(formData: FormData): Promise<ActionResult> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { success: false, error: "Não autorizado" };

  const user = await resolveUser(clerkId);
  if (!user) return { success: false, error: "Usuário não encontrado" };

  const parsed = clientSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email") || "",
    phone: formData.get("phone") || "",
    document: formData.get("document") || "",
    notes: formData.get("notes") || "",
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos",
    };
  }

  const { name, email, phone, document, notes } = parsed.data;

  await db.client.create({
    data: {
      userId: user.id,
      name: name.trim(),
      email: nullIfEmpty(email),
      phone: nullIfEmpty(phone),
      document: nullIfEmpty(document),
      notes: nullIfEmpty(notes),
    },
  });

  revalidatePath("/settings");

  return { success: true, data: undefined };
}

export async function updateClient(
  clientId: string,
  formData: FormData,
): Promise<ActionResult> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { success: false, error: "Não autorizado" };

  const user = await resolveUser(clerkId);
  if (!user) return { success: false, error: "Usuário não encontrado" };

  const client = await db.client.findFirst({
    where: { id: clientId, userId: user.id, deletedAt: null },
    select: { id: true },
  });

  if (!client) return { success: false, error: "Cliente não encontrado" };

  const parsed = clientSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email") || "",
    phone: formData.get("phone") || "",
    document: formData.get("document") || "",
    notes: formData.get("notes") || "",
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos",
    };
  }

  const { name, email, phone, document, notes } = parsed.data;

  await db.client.update({
    where: { id: client.id },
    data: {
      name: name.trim(),
      email: nullIfEmpty(email),
      phone: nullIfEmpty(phone),
      document: nullIfEmpty(document),
      notes: nullIfEmpty(notes),
    },
  });

  revalidatePath("/settings");

  return { success: true, data: undefined };
}

export async function deleteClient(clientId: string): Promise<ActionResult> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { success: false, error: "Não autorizado" };

  const user = await resolveUser(clerkId);
  if (!user) return { success: false, error: "Usuário não encontrado" };

  const client = await db.client.findFirst({
    where: { id: clientId, userId: user.id, deletedAt: null },
    select: { id: true },
  });

  if (!client) return { success: false, error: "Cliente não encontrado" };

  // Soft delete
  await db.client.update({
    where: { id: client.id },
    data: { deletedAt: new Date() },
  });

  revalidatePath("/settings");

  return { success: true, data: undefined };
}
