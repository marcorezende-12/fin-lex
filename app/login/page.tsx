import Image from "next/image";

import { Button } from "../_components/ui/button";

const LoginPage = () => {
  return (
    <div className="grid h-full grid-cols-2">
      <div className="mx-auto flex h-full max-w-[550px] flex-col justify-center p-8">
        <Image
          src="/logo-1.svg"
          width={173}
          height={39}
          alt="FinLex"
          className="mb-8"
        />
        <h1 className="mb-3 text-4xl font-bold">Bem-vindo</h1>
        <p className="text-muted-f\oreground mb-8">
          O FinLex é uma plataforma de gestão financeira para advogados, que
          concentra todas suas movimentações, oferece visualização personalizada
          e facilita o controle do seu orçamento pessoal ou do seu escritório
        </p>
        <Button variant="outline">
          <Image
            src="/google-icon.png"
            alt="Google"
            width={18}
            height={18}
            className="mr-2"
          />
          Entrar com o Google
        </Button>
      </div>
      <div className="relative h-full w-full">
        <Image
          src="/image-2.png"
          alt="Faça login"
          fill
          className="object-cover"
        />
      </div>
    </div>
  );
};

export default LoginPage;
