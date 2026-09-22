import { ChartColumn, DollarSign, Home, Settings } from "lucide-react";

/** Itens de navegação compartilhados entre a sidebar (desktop) e a bottom nav (mobile). */
export const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Movimentações", url: "/transactions", icon: DollarSign },
  { title: "Gráficos", url: "/charts", icon: ChartColumn },
  { title: "Configurações", url: "/settings", icon: Settings },
];
