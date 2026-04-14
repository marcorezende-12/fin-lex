import { FileTextIcon, TagIcon, UserIcon } from "lucide-react";
import Link from "next/link";

const SETTINGS_SECTIONS = [
  {
    href: "/settings/categories",
    icon: TagIcon,
    label: "Categorias",
    description:
      "Classifique receitas e despesas com categorias personalizadas.",
  },
  {
    href: "/settings/clients",
    icon: UserIcon,
    label: "Clientes",
    description:
      "Gerencie clientes e vincule-os às suas movimentações financeiras.",
  },
  {
    href: "/settings/receipts",
    icon: FileTextIcon,
    label: "Recibos",
    description: "Configure e emita recibos para seus clientes.",
  },
] as const;

const SettingsPage = () => {
  return (
    <div className="flex flex-col gap-8">
      {/* CABEÇALHO */}
      <div>
        <h1 className="text-xl font-bold">Configurações</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Selecione uma seção para gerenciar
        </p>
      </div>

      {/* CARDS DE NAVEGAÇÃO */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SETTINGS_SECTIONS.map(({ href, icon: Icon, label, description }) => (
          <Link key={href} href={href} className="group block">
            <div className="border-border bg-card hover:border-primary/40 hover:bg-muted/40 flex h-full flex-col gap-4 rounded-2xl border p-6 shadow-sm transition-all duration-200 group-hover:shadow-md">
              <div className="bg-primary/10 group-hover:bg-primary/15 flex h-11 w-11 items-center justify-center rounded-xl transition-colors">
                <Icon className="text-primary h-5 w-5" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-foreground font-semibold">{label}</span>
                <span className="text-muted-foreground text-sm leading-relaxed">
                  {description}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SettingsPage;
