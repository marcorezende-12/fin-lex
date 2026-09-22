"use client";

import { endOfMonth, format, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { type DateRange } from "react-day-picker";

import { useIsMobile } from "@/app/_hooks/use-mobile";

import { Button } from "./button";
import { Calendar } from "./calendar";
import { Field } from "./field";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export function DatePickerWithRange() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();

  // Lê as datas da URL; se não existirem, usa o mês atual como padrão
  const initialFrom = searchParams.get("from")
    ? new Date(searchParams.get("from") as string)
    : startOfMonth(new Date());

  const initialTo = searchParams.get("to")
    ? new Date(searchParams.get("to") as string)
    : endOfMonth(new Date());

  const [date, setDate] = React.useState<DateRange | undefined>({
    from: initialFrom,
    to: initialTo,
  });
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSelect = (range: DateRange | undefined) => {
    setDate(range);

    // Só navega e fecha o popover quando o usuário tiver selecionado as
    // duas datas — no clique do "from" o range ainda está incompleto.
    if (!range?.from || !range?.to) return;

    setIsOpen(false);

    const params = new URLSearchParams(searchParams.toString());
    params.set("from", format(range.from, "yyyy-MM-dd"));
    params.set("to", format(range.to, "yyyy-MM-dd"));

    router.push(`?${params.toString()}`);
  };

  return (
    <Field className="w-auto">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date-picker-range"
            className="cursor-pointer justify-start px-2.5 font-normal"
          >
            <CalendarIcon />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "dd MMM, yyyy", { locale: ptBR })} -{" "}
                  {format(date.to, "dd MMM, yyyy", { locale: ptBR })}
                </>
              ) : (
                format(date.from, "dd MMM, yyyy", { locale: ptBR })
              )
            ) : (
              <span>Selecionar período</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={isMobile ? 1 : 2}
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>
    </Field>
  );
}
