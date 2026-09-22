// app/subscription/layout.tsx
// Rota fora do grupo (authenticated): não depende do AppShell nem do gate de
// onboarding, para poder ser acessada mesmo antes/independente do fluxo
// principal do app quando o novo sistema de pagamento for integrado aqui.

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function SubscriptionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  return (
    <div className="flex min-h-dvh items-center justify-center p-6">
      {children}
    </div>
  );
}
