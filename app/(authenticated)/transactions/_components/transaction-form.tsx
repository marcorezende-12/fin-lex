"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PaymentMethod, TransactionType } from "@prisma/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@/app/_components/ui/button";
import { Calendar } from "@/app/_components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/_components/ui/form";
import { Input } from "@/app/_components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/_components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";
import { cn, formatCurrency } from "@/app/_lib/utils";

import {
  TransactionInput,
  transactionSchema,
} from "../_validations/transaction-schema";

interface TransactionFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const PAYMENT_METHOD_OPTIONS = [
  { value: PaymentMethod.PIX, label: "Pix" },
  { value: PaymentMethod.CREDIT_CARD, label: "Cartão de Crédito" },
  { value: PaymentMethod.DEBIT_CARD, label: "Cartão de Débito" },
  { value: PaymentMethod.BOLETO, label: "Boleto" },
  { value: PaymentMethod.BANK_TRANSFER, label: "Transferência Bancária" },
  { value: PaymentMethod.CASH, label: "Dinheiro" },
  { value: PaymentMethod.INSTALLMENT, label: "Parcelado" },
  { value: PaymentMethod.OTHER, label: "Outro" },
];

const TRANSACTION_TYPE_OPTIONS = [
  { value: TransactionType.INCOME, label: "Receita" },
  { value: TransactionType.EXPENSE, label: "Despesa" },
];

export function TransactionForm({ onSuccess, onCancel }: TransactionFormProps) {
  const form = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      name: "",
      description: "",
      amount: 0,
      type: TransactionType.EXPENSE,
      paymentMethod: PaymentMethod.PIX,
      date: new Date(),
    },
  });

  const paymentMethod = useWatch({
    control: form.control,
    name: "paymentMethod",
  });

  const onSubmit = async (data: TransactionInput) => {
    const parsedData = transactionSchema.parse(data);
    // TODO: Chamar Server Action futuramente
    console.log(parsedData);
    onSuccess();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* NOME */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome *</FormLabel>
              <FormControl>
                <Input
                  className="w-full"
                  placeholder="Nome do cliente / Despesa"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* DESCRIÇÃO */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição *</FormLabel>
              <FormControl>
                <Input
                  className="w-full"
                  placeholder="Descrição da movimentação"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* VALOR */}
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor *</FormLabel>
              <FormControl>
                <Input
                  className="w-full"
                  placeholder="R$ 0,00"
                  name={field.name}
                  ref={field.ref}
                  onBlur={field.onBlur}
                  value={
                    field.value !== undefined
                      ? formatCurrency(Number(field.value))
                      : ""
                  }
                  onChange={(e) => {
                    const rawValue = e.target.value.replace(/\D/g, "");
                    const numericValue = Number(rawValue) / 100;
                    field.onChange(numericValue);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* TIPO */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full cursor-pointer">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {TRANSACTION_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* CATEGORIA */}
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full cursor-pointer">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {/* TODO: Fetch Categories dynamically */}
                  <SelectItem value="cat-1">Sem Categoria</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* MÉTODO DE PAGAMENTO */}
        <FormField
          control={form.control}
          name="paymentMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Método de pagamento *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full cursor-pointer">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PAYMENT_METHOD_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* DATA */}
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data *</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full cursor-pointer pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP", { locale: ptBR })
                      ) : (
                        <span>Selecionar Data</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* PARCELAMENTO (Condicional) */}
        {paymentMethod === PaymentMethod.INSTALLMENT && (
          <FormField
            control={form.control}
            name="installments"
            render={({ field }) => (
              <FormItem className="border-border bg-muted/50 mt-4 rounded-md border p-4">
                <FormLabel>Número de Parcelas *</FormLabel>
                <FormControl>
                  <Input
                    className="w-full"
                    type="text"
                    inputMode="numeric"
                    placeholder="Ex: 12"
                    {...field}
                    value={(field.value as string | number) || ""}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/\D/g, "");
                      if (rawValue) {
                        field.onChange(Number(rawValue));
                      } else {
                        field.onChange(undefined);
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* BOTÕES */}
        <div className="grid w-full grid-cols-2 gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            className="w-full cursor-pointer"
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="bg-primary text-primary-foreground hover:bg-primary/90 w-full cursor-pointer"
          >
            Adicionar
          </Button>
        </div>
      </form>
    </Form>
  );
}
