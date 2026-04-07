import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { Button } from "../../_components/ui/button";
import { db } from "../../_lib/prisma";

const OnboardingPage = async () => {
  const { userId } = await auth();

  // 1. Se não tiver logado, manda pro login
  if (!userId) {
    redirect("/login");
  }

  // 2. Verifica se o usuário já concluiu o onboarding (já existe no DB)
  const existingUser = await db.user.findUnique({
    where: { clerkId: userId },
  });

  if (existingUser) {
    redirect("/"); // Já fez o onboarding, vai pro Dashboard
  }

  const clerkUser = await currentUser();
  const primaryEmail = clerkUser?.emailAddresses[0]?.emailAddress;

  // Server action que será chamada ao submeter o formulário
  const completeOnboarding = async (formData: FormData) => {
    "use server";

    const name = formData.get("name") as string;

    const { userId } = await auth();
    const clerkUser = await currentUser();

    if (!userId || !clerkUser) {
      throw new Error("Não autorizado");
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress;
    if (!email) throw new Error("Email não encontrado");

    // Cria o usuário no banco de dados do Prisma
    await db.user.create({
      data: {
        clerkId: userId,
        email: email,
        name:
          name ||
          `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim(),
        avatarUrl: clerkUser.imageUrl,
      },
    });

    // 3. Após concluir o cadastro, redireciona para o Dashboard
    redirect("/");
  };

  return (
    <div className="flex h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold">Completar Cadastro</h1>
        <p className="mb-6 text-sm text-gray-500">
          Precisamos de mais algumas informações para finalizar sua conta.
        </p>

        <form action={completeOnboarding} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Nome Completo
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              defaultValue={
                clerkUser?.firstName
                  ? `${clerkUser.firstName} ${clerkUser?.lastName || ""}`.trim()
                  : ""
              }
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Digite seu nome completo"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              disabled
              value={primaryEmail || ""}
              className="border-input bg-muted ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <Button type="submit" className="mt-4 w-full">
            Finalizar Cadastro e Acessar
          </Button>
        </form>
      </div>
    </div>
  );
};

export default OnboardingPage;
