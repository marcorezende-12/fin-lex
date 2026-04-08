"use client";

import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

import { Button } from "@/app/_components/ui/button";

export function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full cursor-pointer" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Finalizando...
        </>
      ) : (
        "Finalizar Cadastro e Entrar"
      )}
    </Button>
  );
}
