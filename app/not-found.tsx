// app/not-found.tsx
// Página 404 customizada, exibida quando notFound() é chamado ou nenhuma
// rota corresponde.

import Link from "next/link";

import { Button } from "@/app/_components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";

export default function NotFound() {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Página não encontrada</CardTitle>
          <CardDescription>
            O endereço acessado não existe ou foi movido.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="cursor-pointer">
            <Link href="/dashboard">Voltar ao início</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
