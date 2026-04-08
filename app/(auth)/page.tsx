import { SignInButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import { redirect } from "next/navigation";

import { Button } from "../_components/ui/button";
import { db } from "../_lib/prisma";

const LoginPage = async () => {
  const { userId } = await auth();

  // Se o usuário está autenticado, verifica no banco de dados
  if (userId) {
    const user = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (user) {
      redirect("/dashboard"); // Já existe no DB, vai pro Dashboard
    } else {
      redirect("/onboarding"); // Não existe no DB, vai pro Onboarding
    }
  }

  // Se não estiver autenticado, exibe a tela de login
  return (
    <div className="grid h-full grid-cols-2">
      <div className="mx-auto flex h-full max-w-[550px] flex-col justify-center p-8">
        <Image
          src="/dark-logo.svg"
          alt="FinLex"
          width={173}
          height={39}
          className="mb-8 hidden dark:block"
        />
        <Image
          src="/light-logo.svg"
          alt="FinLex"
          width={173}
          height={39}
          className="mb-8 block dark:hidden"
        />
        <h1 className="mb-3 text-4xl font-bold">Bem-vindo</h1>
        <p className="text-muted-foreground mb-8">
          O FinLex é uma plataforma de gestão financeira para advogados, que
          concentra todas suas movimentações, oferece visualização personalizada
          e facilita o controle do seu orçamento pessoal ou do seu escritório
        </p>
        <SignInButton>
          <Button variant="outline" className="cursor-pointer">
            <Image
              src="/google-icon.png"
              alt="Google"
              width={18}
              height={18}
              className="mr-2"
            />
            Fazer login ou criar conta
          </Button>
        </SignInButton>
      </div>
      <div className="relative h-full w-full">
        <Image
          src="/login-image.png"
          alt="Faça login"
          fill
          className="object-cover"
        />
      </div>
    </div>
  );
};

export default LoginPage;
