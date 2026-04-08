// components/AppSidebar.tsx
"use client";
import { UserButton, useUser } from "@clerk/nextjs";
import {
  ChartColumn,
  DollarSign,
  Home,
  Menu,
  NotebookPen,
  Settings,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "../ui/sidebar";
import { ThemeToggle } from "../ui/theme-toggle";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Movimentações", url: "/transactions", icon: DollarSign },
  { title: "Gráficos", url: "/charts", icon: ChartColumn },
  { title: "Configurações", url: "/settings", icon: Settings },
  { title: "Assinatura", url: "/subscription", icon: NotebookPen },
];

export function AppSidebar() {
  // Hook do Clerk: pega dados do usuário atual (nome, imagem, etc)
  const { user, isLoaded } = useUser();
  const pathname = usePathname();

  // Enquanto carrega, mostra placeholder ou skeleton
  const displayName = isLoaded
    ? user?.firstName || user?.username || "Usuário"
    : "Carregando...";

  // Hook do shadcn sidebar: dá acesso ao estado atual (expanded ou collapsed)
  const { state } = useSidebar(); // state é "expanded" | "collapsed" (string literal)

  // Variável auxiliar para legibilidade (true quando sidebar está expandida)
  const isExpanded = state === "expanded";

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader className="border-b border-gray-500">
        <div className="flex items-center justify-between">
          {isExpanded && (
            <SidebarGroupLabel className="text-xl font-bold text-white">
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
            </SidebarGroupLabel>
          )}
          <div>{isExpanded && <ThemeToggle />}</div>
          <SidebarTrigger className="cursor-pointer">
            <Menu className="h-5 w-5" />
          </SidebarTrigger>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = pathname === item.url;

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={isActive}
                      className={`transition-colors duration-200 ${isActive ? "bg-accent text-accent-foreground" : ""} `}
                    >
                      <Link href={item.url}>
                        <item.icon
                          className={`h-5 w-5 transition-transform ${isActive ? "scale-110 text-green-600" : ""}`}
                        />
                        <span
                          className={`${isActive ? "font-bold text-green-600" : ""}`}
                        >
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {isExpanded && (
        <SidebarFooter>
          <div className="flex items-center justify-between px-4 py-2">
            <UserButton afterSignOutUrl="/" />
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{displayName}</span>
            </div>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
