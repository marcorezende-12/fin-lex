"use client";

import { MoreHorizontalIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/app/_components/ui/sheet";
import { cn } from "@/app/_lib/utils";

import { menuItems } from "./menu-items";

const primaryItems = menuItems.filter((item) => item.mobilePrimary);
const moreItems = menuItems.filter((item) => !item.mobilePrimary);

/**
 * Navegação inferior exibida apenas abaixo de `md` (onde a sidebar some).
 * O padding inferior respeita a área segura do iOS/Android (barra de gestos).
 *
 * Só os itens marcados `mobilePrimary` viram aba própria — o resto fica
 * atrás do botão "Mais" (sheet), pra barra não crescer a cada item novo do
 * menu. grid-cols precisa bater com primaryItems.length + 1 (a aba "Mais")
 * — Tailwind não gera classes dinâmicas (`grid-cols-${n}`), então isso é
 * atualizado à mão se a lista de itens primários mudar.
 */
export function BottomNav() {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const isItemActive = (url: string) =>
    pathname === url || pathname.startsWith(`${url}/`);
  const isMoreActive = moreItems.some((item) => isItemActive(item.url));

  return (
    <nav
      aria-label="Navegação principal"
      className="bg-background shrink-0 border-t pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="grid grid-cols-5">
        {primaryItems.map((item) => {
          const isActive = isItemActive(item.url);

          return (
            <li key={item.url}>
              <Link
                href={item.url}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "text-muted-foreground flex h-16 flex-col items-center justify-center gap-1 px-1 text-[11px] font-medium tracking-tight transition-colors",
                  isActive && "font-bold text-green-600",
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 transition-transform",
                    isActive && "scale-110",
                  )}
                />
                <span className="max-w-full truncate">{item.title}</span>
              </Link>
            </li>
          );
        })}

        <li>
          <Sheet open={isMoreOpen} onOpenChange={setIsMoreOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-current={isMoreActive ? "page" : undefined}
                className={cn(
                  "text-muted-foreground flex h-16 w-full flex-col items-center justify-center gap-1 px-1 text-[11px] font-medium tracking-tight transition-colors",
                  isMoreActive && "font-bold text-green-600",
                )}
              >
                <MoreHorizontalIcon
                  className={cn(
                    "h-5 w-5 transition-transform",
                    isMoreActive && "scale-110",
                  )}
                />
                <span className="max-w-full truncate">Mais</span>
              </button>
            </SheetTrigger>
            <SheetContent
              side="bottom"
              className="pb-[env(safe-area-inset-bottom)]"
            >
              <SheetHeader>
                <SheetTitle>Mais opções</SheetTitle>
              </SheetHeader>
              <ul className="flex flex-col gap-1 px-4 pb-4">
                {moreItems.map((item) => {
                  const isActive = isItemActive(item.url);

                  return (
                    <li key={item.url}>
                      <SheetClose asChild>
                        <Link
                          href={item.url}
                          aria-current={isActive ? "page" : undefined}
                          className={cn(
                            "text-foreground flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                            isActive
                              ? "bg-primary/10 text-green-600"
                              : "hover:bg-muted",
                          )}
                        >
                          <item.icon className="h-5 w-5" />
                          {item.title}
                        </Link>
                      </SheetClose>
                    </li>
                  );
                })}
              </ul>
            </SheetContent>
          </Sheet>
        </li>
      </ul>
    </nav>
  );
}
