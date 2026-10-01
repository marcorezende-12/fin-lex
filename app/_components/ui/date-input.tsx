"use client";

import { format, isValid, parse } from "date-fns";
import { CalendarIcon } from "lucide-react";
import * as React from "react";

import { cn } from "@/app/_lib/utils";

import { Calendar } from "./calendar";
import { Input } from "./input";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

const DISPLAY_FORMAT = "dd/MM/yyyy";

/** Formata uma data no padrão exibido/digitado pelo usuário (dd/mm/aaaa). */
export function formatDateText(date: Date | undefined): string {
  return date ? format(date, DISPLAY_FORMAT) : "";
}

/**
 * Aplica a máscara dd/mm/aaaa ao texto digitado: descarta tudo que não é
 * dígito e insere as barras nas posições certas.
 */
export function maskDateText(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

/**
 * Converte "dd/mm/aaaa" em Date (meia-noite local). Retorna undefined para
 * texto incompleto ou data inexistente (ex.: 31/02/2026).
 */
export function parseDateText(text: string): Date | undefined {
  if (text.length !== DISPLAY_FORMAT.length) return undefined;
  const date = parse(text, DISPLAY_FORMAT, new Date());
  return isValid(date) && date.getFullYear() >= 1900 ? date : undefined;
}

interface DateTextInputProps extends Omit<
  React.ComponentProps<"input">,
  "value" | "onChange" | "type" | "defaultValue"
> {
  value: Date | undefined;
  /** Chamado só quando o texto forma uma data válida e permitida. */
  onChange: (date: Date) => void;
  /** Datas que não podem ser escolhidas (mesma regra aplicada no calendário). */
  isDateDisabled?: (date: Date) => boolean;
}

/**
 * Campo de texto com máscara dd/mm/aaaa. Mantém o texto digitado em estado
 * local e só propaga a data quando ela está completa e válida; ao perder o
 * foco com um valor inválido, volta a exibir a última data válida.
 */
export function DateTextInput({
  value,
  onChange,
  isDateDisabled,
  onBlur,
  className,
  ...props
}: DateTextInputProps) {
  const [text, setText] = React.useState(formatDateText(value));

  // Sincroniza quando a data muda por fora (calendário, reset do formulário…)
  const valueKey = value?.getTime();
  React.useEffect(() => {
    setText(formatDateText(valueKey === undefined ? undefined : value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valueKey]);

  const commit = (masked: string) => {
    const parsed = parseDateText(masked);
    if (parsed && !isDateDisabled?.(parsed)) onChange(parsed);
  };

  return (
    <Input
      type="text"
      inputMode="numeric"
      autoComplete="off"
      placeholder="dd/mm/aaaa"
      value={text}
      className={className}
      onChange={(e) => {
        const masked = maskDateText(e.target.value);
        setText(masked);
        commit(masked);
      }}
      onBlur={(e) => {
        const parsed = parseDateText(text);
        if (!parsed || isDateDisabled?.(parsed)) setText(formatDateText(value));
        onBlur?.(e);
      }}
      {...props}
    />
  );
}

interface DateInputProps extends DateTextInputProps {
  /** Classe do contêiner (campo + botão do calendário). */
  containerClassName?: string;
  align?: "start" | "center" | "end";
}

/**
 * Seletor de data que aceita tanto digitação (dd/mm/aaaa) quanto escolha
 * pelo calendário, aberto pelo ícone à direita do campo.
 *
 * Props extras (id, aria-*) vão para o <input>, então funciona dentro de
 * <FormControl> do react-hook-form.
 */
export function DateInput({
  value,
  onChange,
  isDateDisabled,
  containerClassName,
  className,
  align = "start",
  disabled,
  ...props
}: DateInputProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className={cn("relative w-full", containerClassName)}>
      <DateTextInput
        value={value}
        onChange={onChange}
        isDateDisabled={isDateDisabled}
        disabled={disabled}
        className={cn("pr-10", className)}
        {...props}
      />
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            aria-label="Abrir calendário"
            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer transition-colors disabled:pointer-events-none disabled:opacity-50"
          >
            <CalendarIcon className="h-4 w-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align={align}>
          <Calendar
            mode="single"
            selected={value}
            defaultMonth={value}
            onSelect={(date) => {
              if (date) onChange(date);
              setIsOpen(false);
            }}
            disabled={isDateDisabled}
            autoFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
