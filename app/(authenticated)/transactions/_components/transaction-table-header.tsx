import { TableHead, TableHeader, TableRow } from "@/app/_components/ui/table";

/**
 * Cabeçalho fixo da tabela de transações.
 * Responsabilidade única: definir colunas e seus rótulos.
 */
export function TransactionTableHeader() {
  return (
    <TableHeader>
      <TableRow className="border-border hover:bg-transparent">
        <TableHead className="text-muted-foreground w-[40px] pl-6 font-medium">
          Pago
        </TableHead>
        <TableHead className="text-muted-foreground font-medium">
          Nome
        </TableHead>
        <TableHead className="text-muted-foreground font-medium">
          Descrição
        </TableHead>
        <TableHead className="text-muted-foreground font-medium">
          Status
        </TableHead>
        <TableHead className="text-muted-foreground font-medium">
          Vencimento
        </TableHead>
        <TableHead className="text-muted-foreground font-medium">
          Pagamento
        </TableHead>
        <TableHead className="text-muted-foreground font-medium">
          Parcela
        </TableHead>
        <TableHead className="text-muted-foreground font-medium">
          Valor
        </TableHead>
        <TableHead className="pr-6 text-right" />
      </TableRow>
    </TableHeader>
  );
}
