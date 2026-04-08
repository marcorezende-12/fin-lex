// app/(onboarding)/page.tsx
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { completeOnboarding } from "@/app/actions/onboarding";

const OnboardingPage = async () => {
  const { userId } = await auth();

  // Apenas verifica autenticação (não toca no banco)
  if (!userId) {
    redirect("/");
  }

  const clerkUser = await currentUser();
  const primaryEmail = clerkUser?.emailAddresses[0]?.emailAddress || "";

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-xl border bg-white p-8 shadow-sm">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Bem-vindo ao FinLex
          </h1>
          <p className="mt-2 text-gray-600">
            Vamos finalizar seu cadastro para começar a usar a plataforma.
          </p>
        </div>

        <form action={completeOnboarding} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-gray-700">
              Nome Completo
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              required
              defaultValue={
                clerkUser
                  ? `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim()
                  : ""
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-black focus:ring-2 focus:ring-green-600 focus:outline-none"
              placeholder="Digite seu nome completo"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <Input
              type="email"
              disabled
              value={primaryEmail}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-black focus:ring-2 focus:ring-green-600 focus:outline-none"
              placeholder="Digite seu email"
            />
          </div>

          <Button
            type="submit"
            className="w-full cursor-pointer py-3 text-base font-medium"
          >
            Finalizar Cadastro e Entrar
          </Button>
        </form>
      </div>
    </div>
  );
};

export default OnboardingPage;
