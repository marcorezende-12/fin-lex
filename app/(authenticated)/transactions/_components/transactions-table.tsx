import { DownloadIcon, ExternalLinkIcon, TrashIcon } from "lucide-react";

import { Badge } from "@/app/_components/ui/badge";
import { Button } from "@/app/_components/ui/button";
import { Checkbox } from "@/app/_components/ui/checkbox";
import { ScrollArea } from "@/app/_components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/_components/ui/table";

// Dados estáticos de exemplo baseado na sua imagem
const transactions = [
  {
    id: 1,
    name: "Lucas Theophilo",
    description: "Processo Civil",
    status: "Atrasado",
    installment: "1/9",
    amount: "- R$ 2.500,00",
    type: "expense",
  },
  {
    id: 2,
    name: "Lucas Theophilo",
    description: "Processo Civil",
    status: "Pago",
    installment: "1/9",
    amount: "+ R$ 2.500,00",
    type: "income",
  },
  {
    id: 3,
    name: "Lucas Theophilo",
    description: "Processo Civil",
    status: "Pago",
    installment: "1/9",
    amount: "+ R$ 2.500,00",
    type: "income",
  },
  {
    id: 4,
    name: "Lucas Theophilo",
    description: "Processo Civil",
    status: "A vencer",
    installment: "1/9",
    amount: "+ R$ 2.500,00",
    type: "income",
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Atrasado":
      return (
        <Badge
          variant="ghost"
          className="bg-destructive/10 text-destructive hover:bg-destructive/10 gap-1.5"
        >
          <span className="bg-destructive h-1.5 w-1.5 rounded-full"></span>
          Atrasado
        </Badge>
      );
    case "Pago":
      return (
        <Badge
          variant="ghost"
          className="bg-primary/10 text-primary hover:bg-primary/10 gap-1.5"
        >
          <span className="bg-primary h-1.5 w-1.5 rounded-full"></span>
          Pago
        </Badge>
      );
    case "A vencer":
      return (
        <Badge
          variant="ghost"
          className="gap-1.5 bg-blue-500/10 text-blue-500 hover:bg-blue-500/10"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>A vencer
        </Badge>
      );
    default:
      return null;
  }
};

export function TransactionsTable() {
  return (
    <div className="border-border bg-card flex flex-col overflow-hidden rounded-2xl border p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-bold">Movimentações</h2>
        <Button variant="outline" className="cursor-pointer">
          Ver mais
        </Button>
      </div>

      <ScrollArea className="h-[300px] w-full">
        <Table>
          <TableHeader>
            <TableRow className="border-border text-muted-foreground hover:bg-transparent">
              <TableHead className="text-muted-foreground font-medium">
                <div className="flex items-center gap-3">
                  <span>Nome</span>
                </div>
              </TableHead>
              <TableHead className="text-muted-foreground font-medium">
                Descrição
              </TableHead>
              <TableHead className="text-muted-foreground font-medium">
                Status
              </TableHead>
              <TableHead className="text-muted-foreground font-medium">
                Parcelamento
              </TableHead>
              <TableHead className="text-muted-foreground text-right font-medium">
                Valor
              </TableHead>
              <TableHead className="text-muted-foreground text-right font-medium">
                Opções
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="border-t-0">
            {transactions.map((transaction) => (
              <TableRow
                key={transaction.id}
                className="border-border/50 hover:bg-muted/50 transition-colors"
              >
                <TableCell className="py-4 font-medium">
                  <div className="flex items-center gap-3">
                    <Checkbox id={`transaction-${transaction.id}`} />
                    <label
                      htmlFor={`transaction-${transaction.id}`}
                      className="cursor-pointer"
                    >
                      {transaction.name}
                    </label>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground py-4">
                  {transaction.description}
                </TableCell>
                <TableCell className="py-4">
                  {getStatusBadge(transaction.status)}
                </TableCell>
                <TableCell className="text-muted-foreground py-4">
                  {transaction.installment}
                </TableCell>
                <TableCell
                  className={`py-4 text-right font-medium ${
                    transaction.type === "expense"
                      ? "text-destructive"
                      : "text-primary"
                  }`}
                >
                  {transaction.amount}
                </TableCell>
                <TableCell className="py-4 text-right">
                  <div className="text-muted-foreground flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 cursor-pointer rounded-full"
                    >
                      <ExternalLinkIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 cursor-pointer rounded-full"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 cursor-pointer rounded-full"
                    >
                      <DownloadIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
