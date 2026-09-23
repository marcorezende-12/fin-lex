import {
  ChartColumn,
  ClipboardListIcon,
  CreditCard,
  DollarSign,
  Home,
  type LucideIcon,
  Settings,
} from "lucide-react";

export interface MenuItem {
  title: string;
  url: string;
  icon: LucideIcon;
  /**
   * Mostrado como aba própria na bottom nav (mobile). Os demais ficam
   * agrupados no botão "Mais" (ver BottomNav.tsx) para não estourar o
   * espaço da barra a cada item novo. Ignorado na sidebar (desktop), que
   * sempre lista todos os itens.
   */
  mobilePrimary?: boolean;
}

/** Itens de navegação compartilhados entre a sidebar (desktop) e a bottom nav (mobile). */
export const menuItems: MenuItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: Home, mobilePrimary: true },
  {
    title: "Movimentações",
    url: "/transactions",
    icon: DollarSign,
    mobilePrimary: true,
  },
  {
    title: "Gráficos",
    url: "/charts",
    icon: ChartColumn,
    mobilePrimary: true,
  },
  {
    title: "Relatórios",
    url: "/reports",
    icon: ClipboardListIcon,
    mobilePrimary: true,
  },
  { title: "Assinatura", url: "/subscription", icon: CreditCard },
  { title: "Configurações", url: "/settings", icon: Settings },
];
