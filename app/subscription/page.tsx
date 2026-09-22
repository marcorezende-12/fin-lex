// app/subscription/page.tsx
// Placeholder: aqui entra o novo sistema de pagamento (substitui a integração
// com o Asaas, removida). Ainda sem gateway configurado.

import Link from "next/link";

import { Button } from "@/app/_components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";

export default function SubscriptionPage() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Assinatura</CardTitle>
        <CardDescription>
          Em breve você poderá gerenciar sua assinatura por aqui.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild>
          <Link href="/dashboard">Voltar ao Dashboard</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
