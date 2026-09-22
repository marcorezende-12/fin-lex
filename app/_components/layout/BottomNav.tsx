"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/app/_lib/utils";

import { menuItems } from "./menu-items";

/**
 * Navegação inferior exibida apenas abaixo de `md` (onde a sidebar some).
 * O padding inferior respeita a área segura do iOS/Android (barra de gestos).
 */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegação principal"
      className="bg-background shrink-0 border-t pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {/* grid-cols precisa bater com menuItems.length — Tailwind não gera
          classes dinâmicas (`grid-cols-${n}`), então isso é atualizado à mão
          sempre que um item for adicionado/removido do menu. */}
      <ul className="grid grid-cols-5">
        {menuItems.map((item) => {
          // Seções internas (ex: /settings/clients) mantêm a aba pai ativa
          const isActive =
            pathname === item.url || pathname.startsWith(`${item.url}/`);

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
      </ul>
    </nav>
  );
}
