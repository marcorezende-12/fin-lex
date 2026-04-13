import { UserIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/_components/ui/table";

import { ClientRow } from "../_actions/client-actions";
import { ClientForm } from "./client-form";
import { DeleteClientButton } from "./delete-client-button";
import { EditClientDialog } from "./edit-client-dialog";

interface ClientsSectionProps {
  clients: ClientRow[];
}

export function ClientsSection({ clients }: ClientsSectionProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* FORMULÁRIO */}
      <Card className="border-border bg-card rounded-2xl border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UserIcon className="h-4 w-4" />
            Novo Cliente
          </CardTitle>
          <CardDescription>
            Cadastre clientes para vincular às movimentações financeiras.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ClientForm />
        </CardContent>
      </Card>

      {/* TABELA */}
      <Card className="border-border bg-card rounded-2xl border shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">
            Clientes ({clients.length})
          </CardTitle>
          <CardDescription>
            Lista de todos os clientes cadastrados.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {clients.length === 0 ? (
            <p className="text-muted-foreground p-6 text-center text-sm">
              Nenhum cliente cadastrado ainda.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-muted-foreground pl-6 font-medium">
                      Nome
                    </TableHead>
                    <TableHead className="text-muted-foreground font-medium">
                      E-mail
                    </TableHead>
                    <TableHead className="text-muted-foreground font-medium">
                      Telefone
                    </TableHead>
                    <TableHead className="text-muted-foreground font-medium">
                      CPF/CNPJ
                    </TableHead>
                    <TableHead className="text-muted-foreground text-center font-medium">
                      Transações
                    </TableHead>
                    <TableHead className="pr-4 text-right" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow key={client.id} className="border-border/50">
                      <TableCell className="pl-6 font-medium">
                        {client.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {client.email ?? "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {client.phone ?? "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {client.document ?? "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-center">
                        {client.transactionCount}
                      </TableCell>
                      <TableCell className="pr-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <EditClientDialog client={client} />
                          <DeleteClientButton
                            clientId={client.id}
                            clientName={client.name}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
