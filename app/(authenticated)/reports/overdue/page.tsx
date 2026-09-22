import Link from "next/link";

import { Button } from "@/app/_components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/_components/ui/table";
import { formatCurrency } from "@/app/_lib/utils";

import { getOverdueClients } from "../_actions/get-overdue-clients";
import { DownloadOverduePdfButton } from "../_components/download-overdue-pdf-button";
import { buildOverdueNarrative } from "../_lib/overdue-report";

const OverdueReportPage = async () => {
  const result = await getOverdueClients();

  return (
    <div className="flex flex-col gap-6">
      {/* CABEÇALHO */}
      <div className="flex flex-col gap-3">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="w-fit cursor-pointer"
        >
          <Link href="/reports">← Voltar para relatórios</Link>
        </Button>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold">Inadimplência</h1>
            <p className="text-muted-foreground text-sm">
              Clientes com movimentações em atraso
            </p>
          </div>
          {result.success && <DownloadOverduePdfButton report={result.data} />}
        </div>
      </div>

      {!result.success ? (
        <p className="text-destructive text-sm">{result.error}</p>
      ) : (
        <>
          {/* NARRATIVA */}
          <div className="border-border bg-card rounded-2xl border p-4 shadow-sm">
            <p className="text-sm leading-relaxed">
              {buildOverdueNarrative(result.data)}
            </p>
          </div>

          {/* TABELA */}
          <div className="border-border bg-card overflow-hidden rounded-2xl border shadow-sm">
            {result.data.clients.length === 0 ? (
              <div className="text-muted-foreground flex min-h-[160px] items-center justify-center p-8">
                <p className="text-sm">Nenhum cliente inadimplente. 🎉</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-muted-foreground pl-6 font-medium">
                        Cliente
                      </TableHead>
                      <TableHead className="text-muted-foreground text-center font-medium">
                        Cobranças
                      </TableHead>
                      <TableHead className="text-muted-foreground text-center font-medium">
                        Atraso
                      </TableHead>
                      <TableHead className="text-muted-foreground pr-6 text-right font-medium">
                        Valor em aberto
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.data.clients.map((row) => (
                      <TableRow key={row.clientId} className="border-border/50">
                        <TableCell className="pl-6 font-medium">
                          <Link
                            href={`/settings/clients/${row.clientId}`}
                            className="hover:underline"
                          >
                            {row.clientName}
                          </Link>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-center">
                          {row.transactionCount}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-destructive font-medium">
                            {row.daysOverdue}{" "}
                            {row.daysOverdue === 1 ? "dia" : "dias"}
                          </span>
                        </TableCell>
                        <TableCell className="text-destructive pr-6 text-right font-semibold">
                          {formatCurrency(row.totalOverdueInCents / 100)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default OverdueReportPage;
