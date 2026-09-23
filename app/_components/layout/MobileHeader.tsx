"use client";

import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

import { ThemeToggle } from "../ui/theme-toggle";

/**
 * Cabeçalho exibido apenas abaixo de `md`. Reúne o que no desktop fica no
 * topo/rodapé da sidebar: logo, alternância de tema e menu do usuário.
 */
export function MobileHeader() {
  return (
    <header className="bg-background flex shrink-0 items-center justify-between border-b px-4 pt-[env(safe-area-inset-top)] md:hidden">
      <div className="flex h-14 w-full items-center justify-between">
        <Link href="/dashboard" aria-label="FinLex - ir para o Dashboard">
          <Image
            src="/dark-logo.svg"
            alt="FinLex"
            width={90}
            height={30}
            className="hidden dark:block"
          />
          <Image
            src="/light-logo.svg"
            alt="FinLex"
            width={90}
            height={30}
            className="block dark:hidden"
          />
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <UserButton />
        </div>
      </div>
    </header>
  );
}
