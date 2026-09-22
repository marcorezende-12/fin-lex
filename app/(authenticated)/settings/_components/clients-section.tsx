"use client";

import { SearchIcon, XIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/_components/ui/table";

import { ClientRow } from "../_actions/client-actions";
import { AddClientDialog } from "./add-client-dialog";
import { ClientCard } from "./client-card";
import { DeleteClientButton } from "./delete-client-button";
import { EditClientDialog } from "./edit-client-dialog";

interface ClientsSectionProps {
  clients: ClientRow[];
}

export function ClientsSection({ clients }: ClientsSectionProps) {
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? clients.filter((c) =>
        c.name.toLowerCase().includes(search.trim().toLowerCase()),
      )
    : clients;

  return (
    <div className="flex flex-col gap-4">
      {/* BARRA DE AÇÕES: filtro + botão */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-sm">
          <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Filtrar por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-9 pl-9"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer transition-colors"
              aria-label="Limpar busca"
            >
              <XIcon className="h-4 w-4" />
            </button>
          )}
        </div>
        <AddClientDialog />
      </div>

      {/* TABELA */}
      <div className="border-border bg-card overflow-hidden rounded-2xl border shadow-sm">
        {clients.length === 0 ? (
          <div className="text-muted-foreground flex min-h-[200px] flex-col items-center justify-center gap-2 p-8">
            <p className="text-sm font-medium">Nenhum cliente cadastrado</p>
            <p className="text-xs">
              Clique em &quot;Novo Cliente&quot; para começar.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-muted-foreground flex min-h-[140px] flex-col items-center justify-center gap-1 p-6">
            <p className="text-sm">
              Nenhum cliente encontrado para{" "}
              <span className="font-medium">&quot;{search}&quot;</span>
            </p>
            <Button
              variant="link"
              size="sm"
              className="cursor-pointer p-0 text-xs"
              onClick={() => setSearch("")}
            >
              Limpar filtro
            </Button>
          </div>
        ) : (
          <>
            {/* MOBILE: um card por cliente */}
            <ul className="divide-border/50 divide-y md:hidden">
              {filtered.map((client) => (
                <ClientCard key={client.id} client={client} />
              ))}
            </ul>

            {/* DESKTOP: tabela completa */}
            <div className="hidden overflow-x-auto md:block">
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
                    <TableHead className="pr-6 text-right" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((client) => (
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
                      <TableCell className="pr-6 text-right">
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
          </>
        )}
      </div>

      {/* RODAPÉ com contagem */}
      {filtered.length > 0 && (
        <p className="text-muted-foreground text-right text-xs">
          {filtered.length === clients.length
            ? `${clients.length} cliente${clients.length !== 1 ? "s" : ""}`
            : `${filtered.length} de ${clients.length} cliente${clients.length !== 1 ? "s" : ""}`}
        </p>
      )}
    </div>
  );
}
