"use client";

// app/error.tsx
// Error boundary global do App Router: captura erros não tratados em
// qualquer página/segmento abaixo do root layout (o root layout em si só
// é coberto por global-error.tsx). Sem isso, um erro não tratado resultava
// em tela branca para o usuário.

import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/app/_components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";

export default function GlobalErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalErrorBoundary]", error);
  }, [error]);

  return (
    <div className="flex h-full items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Algo deu errado</CardTitle>
          <CardDescription>
            Ocorreu um erro inesperado. Você pode tentar novamente ou voltar
            para o início.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button onClick={reset} className="cursor-pointer">
            Tentar novamente
          </Button>
          <Button variant="outline" asChild className="cursor-pointer">
            <Link href="/">Voltar ao início</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
