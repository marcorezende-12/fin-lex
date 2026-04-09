import { PlusIcon } from "lucide-react";

import { Button } from "@/app/_components/ui/button";
import { DatePickerWithRange } from "@/app/_components/ui/date-picker";

import { ChartLineMultiple } from "../charts/_components/line-chart";
import { TransactionsTable } from "../transactions/_components/transactions-table";
import SummaryCards from "./_components/summary-cards";

const DashboardPage = async () => {
  return (
    <div className="flex flex-col gap-6">
      {/* 1. CABEÇALHO: Título na esquerda e botão na direita*/}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Dashboard</h1>
      </div>
      <div className="flex justify-between">
        <DatePickerWithRange />
        <Button className="cursor-pointer font-bold">
          <PlusIcon size={4} />
          Adicionar Transação
        </Button>
      </div>

      {/* 2. DIVISÃO DA TELA: 2/3 (Cards) e 1/3 (Gráfico) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ESQUERDA: */}
        <div className="h-[400px] lg:col-span-2">
          <SummaryCards />
        </div>
        <div className="h-[400px]">
          <ChartLineMultiple />
        </div>
      </div>

      {/* 3. TABELA DE MOVIMENTAÇÕES RECENTES */}
      <TransactionsTable />
    </div>
  );
};

export default DashboardPage;
