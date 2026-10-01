"use client";

import {
  endOfMonth,
  endOfYear,
  format,
  parseISO,
  startOfMonth,
  startOfYear,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, XIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { type DateRange } from "react-day-picker";

import { useIsMobile } from "@/app/_hooks/use-mobile";
import { cn } from "@/app/_lib/utils";

import { Button } from "./button";
import { Calendar } from "./calendar";
import { DateTextInput } from "./date-input";
import { Field } from "./field";
import { Label } from "./label";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

const URL_FORMAT = "yyyy-MM-dd";

/** Atalhos de período comuns, calculados no momento do clique. */
const PRESETS: { label: string; range: () => { from: Date; to: Date } }[] = [
  {
    label: "Este mês",
    range: () => ({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    }),
  },
  {
    label: "Mês passado",
    range: () => {
      const lastMonth = subMonths(new Date(), 1);
      return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
    },
  },
  {
    label: "Últimos 3 meses",
    range: () => ({
      from: startOfMonth(subMonths(new Date(), 2)),
      to: endOfMonth(new Date()),
    }),
  },
  {
    label: "Este ano",
    range: () => ({ from: startOfYear(new Date()), to: endOfYear(new Date()) }),
  },
];

/** Lê "yyyy-MM-dd" da URL como data local (new Date() leria como UTC). */
function readParam(value: string | null): Date | undefined {
  if (!value) return undefined;
  const date = parseISO(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

interface DatePickerWithRangeProps {
  /**
   * Sem período na URL, assume o mês atual (padrão — dashboard). Com `false`,
   * mostra "Todo o período" e permite limpar o filtro (listagem).
   */
  defaultToCurrentMonth?: boolean;
  className?: string;
}

/**
 * Seletor de período sincronizado com os parâmetros `from`/`to` da URL.
 * O período pode ser escolhido no calendário, digitado nos campos De/Até
 * (dd/mm/aaaa) ou por um dos atalhos.
 */
export function DatePickerWithRange({
  defaultToCurrentMonth = true,
  className,
}: DatePickerWithRangeProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();

  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  // Período aplicado (o que está na URL, ou o padrão)
  const applied = React.useMemo<DateRange | undefined>(() => {
    const from = readParam(fromParam);
    const to = readParam(toParam);
    if (from || to) return { from, to };
    if (!defaultToCurrentMonth) return undefined;
    return { from: startOfMonth(new Date()), to: endOfMonth(new Date()) };
  }, [fromParam, toParam, defaultToCurrentMonth]);

  // Rascunho editado dentro do popover — só vai pra URL ao aplicar
  const [draft, setDraft] = React.useState<DateRange | undefined>(applied);
  const [isOpen, setIsOpen] = React.useState(false);

  const handleOpenChange = (open: boolean) => {
    if (open) setDraft(applied);
    setIsOpen(open);
  };

  const pushRange = (range: DateRange | undefined) => {
    const params = new URLSearchParams(searchParams.toString());
    if (range?.from && range?.to) {
      params.set("from", format(range.from, URL_FORMAT));
      params.set("to", format(range.to, URL_FORMAT));
    } else {
      params.delete("from");
      params.delete("to");
    }
    // Mudou o filtro — a página atual pode nem existir mais
    params.delete("page");
    router.push(`?${params.toString()}`);
  };

  const apply = (range: DateRange) => {
    if (!range.from || !range.to) return;
    // Aceita as datas digitadas em qualquer ordem
    const ordered =
      range.from > range.to ? { from: range.to, to: range.from } : range;
    setIsOpen(false);
    pushRange(ordered);
  };

  // No calendário, o 1º clique sempre inicia um novo período e o 2º o
  // completa e aplica — sem isso, com o período atual pré-selecionado, cada
  // clique só moveria uma das pontas e já aplicaria.
  const handleCalendarSelect = (_: DateRange | undefined, day: Date) => {
    if (draft?.from && !draft.to) {
      apply({ from: draft.from, to: day });
    } else {
      setDraft({ from: day, to: undefined });
    }
  };

  const canApply = !!draft?.from && !!draft?.to;

  const label = applied?.from ? (
    <>
      {format(applied.from, "dd MMM, yyyy", { locale: ptBR })}
      {applied.to && (
        <> - {format(applied.to, "dd MMM, yyyy", { locale: ptBR })}</>
      )}
    </>
  ) : (
    <span>Todo o período</span>
  );

  return (
    <Field className={cn("w-auto", className)}>
      <div className="flex items-center gap-1">
        <Popover open={isOpen} onOpenChange={handleOpenChange}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              id="date-picker-range"
              className="w-full cursor-pointer justify-start px-2.5 font-normal md:w-auto"
            >
              <CalendarIcon />
              {label}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" align="start">
            {/* ATALHOS */}
            <div className="mb-3 flex flex-wrap gap-2">
              {PRESETS.map((preset) => (
                <Button
                  key={preset.label}
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="cursor-pointer"
                  onClick={() => apply(preset.range())}
                >
                  {preset.label}
                </Button>
              ))}
            </div>

            {/* DIGITAÇÃO */}
            <form
              className="mb-2 flex items-end gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (draft) apply(draft);
              }}
            >
              <div className="flex flex-1 flex-col gap-1">
                <Label htmlFor="range-from" className="text-xs">
                  De
                </Label>
                <DateTextInput
                  id="range-from"
                  value={draft?.from}
                  onChange={(from) => setDraft((d) => ({ from, to: d?.to }))}
                />
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <Label htmlFor="range-to" className="text-xs">
                  Até
                </Label>
                <DateTextInput
                  id="range-to"
                  value={draft?.to}
                  onChange={(to) => setDraft((d) => ({ from: d?.from, to }))}
                />
              </div>
              <Button
                type="submit"
                disabled={!canApply}
                className="cursor-pointer max-md:h-11"
              >
                Aplicar
              </Button>
            </form>

            <Calendar
              mode="range"
              defaultMonth={draft?.from}
              selected={draft}
              onSelect={handleCalendarSelect}
              numberOfMonths={isMobile ? 1 : 2}
              className="p-0"
            />
          </PopoverContent>
        </Popover>

        {!defaultToCurrentMonth && applied && (
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
            onClick={() => pushRange(undefined)}
            aria-label="Limpar período"
          >
            <XIcon className="h-4 w-4" />
          </Button>
        )}
      </div>
    </Field>
  );
}
