// app/(onboarding)/page.tsx
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { Input } from "@/app/_components/ui/input";
import { completeOnboarding } from "@/app/actions/onboarding";

import { SubmitButton } from "./_components/submit-button";

const OnboardingPage = async () => {
  const { userId } = await auth();

  // Apenas verifica autenticação (não toca no banco)
  if (!userId) {
    redirect("/");
  }

  const clerkUser = await currentUser();
  const primaryEmail = clerkUser?.emailAddresses[0]?.emailAddress || "";

  return (
    <div className="bg-background flex h-screen items-center justify-center p-4">
      <div className="border-border bg-card text-card-foreground w-full max-w-md rounded-xl border p-8 shadow-sm">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Bem-vindo ao FinLex
          </h1>
          <p className="text-muted-foreground mt-2">
            Vamos finalizar seu cadastro para começar a usar a plataforma.
          </p>
        </div>

        <form action={completeOnboarding} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
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
              placeholder="Digite seu nome completo"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Email
            </label>
            <Input
              type="email"
              disabled
              value={primaryEmail}
              placeholder="Digite seu email"
            />
          </div>

          <SubmitButton />
        </form>
      </div>
    </div>
  );
};

export default OnboardingPage;
