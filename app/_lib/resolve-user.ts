import { db } from "@/app/_lib/prisma";

/** Resolve o usuário interno (User.id) a partir do clerkId autenticado. */
export async function resolveUser(clerkId: string | null) {
  if (!clerkId) return null;
  return db.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });
}
