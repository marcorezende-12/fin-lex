import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
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

import { getUpcomingCharges } from "../_actions/get-upcoming-charges";
import { DownloadUpcomingPdfButton } from "../_components/download-upcoming-pdf-button";
import { WindowDaysFilter } from "../_components/window-days-filter";
import { buildUpcomingNarrative } from "../_lib/upcoming-report";

const VALID_WINDOWS = [7, 15, 30, 60];

interface UpcomingReportPageProps {
  searchParams: Promise<{ days?: string }>;
}

const UpcomingReportPage = async ({
  searchParams,
}: UpcomingReportPageProps) => {
  const { days } = await searchParams;
  const parsedDays = parseInt(days ?? "30", 10);
  const windowDays = VALID_WINDOWS.includes(parsedDays) ? parsedDays : 30;

  const result = await getUpcomingCharges(windowDays);

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
            <h1 className="text-xl font-bold">Próximas Cobranças</h1>
            <p className="text-muted-foreground text-sm">
              Receitas pendentes com vencimento próximo
            </p>
          </div>
          {result.success && <DownloadUpcomingPdfButton report={result.data} />}
        </div>
      </div>

      {/* FILTRO */}
      <WindowDaysFilter value={windowDays} />

      {!result.success ? (
        <p className="text-destructive text-sm">{result.error}</p>
      ) : (
        <>
          {/* NARRATIVA */}
          <div className="border-border bg-card rounded-2xl border p-4 shadow-sm">
            <p className="text-sm leading-relaxed">
              {buildUpcomingNarrative(result.data)}
            </p>
          </div>

          {/* TABELA */}
          <div className="border-border bg-card overflow-hidden rounded-2xl border shadow-sm">
            {result.data.charges.length === 0 ? (
              <div className="text-muted-foreground flex min-h-[160px] items-center justify-center p-8">
                <p className="text-sm">
                  Nenhuma cobrança prevista para esse período.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-muted-foreground pl-6 font-medium">
                        Cliente / Movimentação
                      </TableHead>
                      <TableHead className="text-muted-foreground font-medium">
                        Vencimento
                      </TableHead>
                      <TableHead className="text-muted-foreground text-center font-medium">
                        Em
                      </TableHead>
                      <TableHead className="text-muted-foreground pr-6 text-right font-medium">
                        Valor
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.data.charges.map((charge) => (
                      <TableRow
                        key={charge.transactionId}
                        className="border-border/50"
                      >
                        <TableCell className="pl-6 font-medium">
                          {charge.clientId ? (
                            <Link
                              href={`/settings/clients/${charge.clientId}`}
                              className="hover:underline"
                            >
                              {charge.clientName}
                            </Link>
                          ) : (
                            charge.clientName
                          )}
                          <span className="text-muted-foreground block text-xs font-normal">
                            {charge.name}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(charge.dueDate, "dd/MM/yyyy", {
                            locale: ptBR,
                          })}
                        </TableCell>
                        <TableCell className="text-center">
                          {charge.daysUntilDue === 0 ? (
                            <span className="font-medium text-blue-500">
                              Hoje
                            </span>
                          ) : (
                            `${charge.daysUntilDue}d`
                          )}
                        </TableCell>
                        <TableCell className="text-primary pr-6 text-right font-semibold">
                          {formatCurrency(charge.amountInCents / 100)}
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

export default UpcomingReportPage;
