import {
  AlertTriangleIcon,
  CalendarClockIcon,
  TrendingUpIcon,
} from "lucide-react";
import Link from "next/link";

const REPORT_SECTIONS = [
  {
    href: "/reports/overdue",
    icon: AlertTriangleIcon,
    label: "Inadimplência",
    description:
      "Clientes com movimentações em atraso — quanto devem e há quanto tempo.",
  },
  {
    href: "/reports/upcoming",
    icon: CalendarClockIcon,
    label: "Próximas Cobranças",
    description: "O que está previsto para receber nos próximos dias.",
  },
  {
    href: "/reports/period",
    icon: TrendingUpIcon,
    label: "Resultado do Período",
    description:
      "Quanto entrou, quanto saiu e o lucro de um mês ou ano específico.",
  },
] as const;

const ReportsPage = () => {
  return (
    <div className="flex flex-col gap-8">
      {/* CABEÇALHO */}
      <div>
        <h1 className="text-xl font-bold">Relatórios</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Selecione um relatório para visualizar e exportar em PDF
        </p>
      </div>

      {/* CARDS DE NAVEGAÇÃO */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {REPORT_SECTIONS.map(({ href, icon: Icon, label, description }) => (
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

export default ReportsPage;
