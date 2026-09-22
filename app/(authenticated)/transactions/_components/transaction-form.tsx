"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

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
import { PaymentMethod, TransactionType } from "@/generated/prisma";

import { createTransaction } from "../_actions/create-transaction";
import {
  SelectOption,
  TYPE_OPTIONS as TRANSACTION_TYPE_OPTIONS,
} from "../_types";
import {
  TransactionInput,
  transactionSchema,
} from "../_validations/transaction-schema";
import { InstallmentsDialog } from "./installments-dialog";
import { RecurringDialog } from "./recurring-dialog";

interface TransactionFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  categories?: SelectOption[];
  clients?: SelectOption[];
}

// Label expandido para o formulário de criação (mais descritivo que o filtro)
const PAYMENT_METHOD_OPTIONS = [
  { value: PaymentMethod.PIX, label: "Pix" },
  { value: PaymentMethod.CREDIT_CARD, label: "Cartão de Crédito" },
  { value: PaymentMethod.DEBIT_CARD, label: "Cartão de Débito" },
  { value: PaymentMethod.BOLETO, label: "Boleto" },
  { value: PaymentMethod.BANK_TRANSFER, label: "Transferência Bancária" },
  { value: PaymentMethod.CASH, label: "Dinheiro" },
  { value: PaymentMethod.INSTALLMENT, label: "Parcelado" },
  { value: PaymentMethod.RECURRING, label: "Recorrente" },
  { value: PaymentMethod.OTHER, label: "Outro" },
];

export function TransactionForm({
  onSuccess,
  onCancel,
  categories = [],
  clients = [],
}: TransactionFormProps) {
  const [isInstallmentsDialogOpen, setIsInstallmentsDialogOpen] =
    useState(false);
  const [isRecurringDialogOpen, setIsRecurringDialogOpen] = useState(false);

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
  }) as PaymentMethod;

  const amount = useWatch({
    control: form.control,
    name: "amount",
  }) as number;

  const installments = useWatch({
    control: form.control,
    name: "installments",
  }) as number | undefined;

  const date = useWatch({
    control: form.control,
    name: "date",
  }) as Date;

  const recurringConfigured = useWatch({
    control: form.control,
    name: "recurringConfigured",
  }) as boolean | undefined;

  const recurringEndDate = useWatch({
    control: form.control,
    name: "recurringEndDate",
  }) as Date | null | undefined;

  const onSubmit = async (data: TransactionInput) => {
    const parsedData = transactionSchema.parse(data);
    const result = await createTransaction(parsedData);

    if (!result.success) {
      form.setError("root", { message: result.error });
      return;
    }

    toast.success("Movimentação adicionada");
    onSuccess();
  };

  return (
    <>
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
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
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
                <Select
                  onValueChange={field.onChange}
                  value={field.value ?? ""}
                >
                  <FormControl>
                    <SelectTrigger className="w-full cursor-pointer">
                      <SelectValue placeholder="Sem categoria" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.length === 0 ? (
                      <div className="text-muted-foreground px-3 py-2 text-sm">
                        Nenhuma categoria cadastrada
                      </div>
                    ) : (
                      categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* CLIENTE */}
          <FormField
            control={form.control}
            name="clientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cliente</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value ?? ""}
                >
                  <FormControl>
                    <SelectTrigger className="w-full cursor-pointer">
                      <SelectValue placeholder="Sem cliente" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {clients.length === 0 ? (
                      <div className="text-muted-foreground px-3 py-2 text-sm">
                        Nenhum cliente cadastrado
                      </div>
                    ) : (
                      clients.map((client) => (
                        <SelectItem key={client.value} value={client.value}>
                          {client.label}
                        </SelectItem>
                      ))
                    )}
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
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
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
            <div className="border-border bg-muted/50 mt-4 space-y-4 rounded-md border p-4">
              {installments && installments > 0 ? (
                <div className="text-center text-sm font-medium text-zinc-300">
                  {installments} parcelas configuradas
                </div>
              ) : null}
              <Button
                type="button"
                variant="secondary"
                className="w-full cursor-pointer bg-zinc-800 text-white hover:bg-zinc-700"
                onClick={() => setIsInstallmentsDialogOpen(true)}
              >
                Configurar Parcelas
              </Button>
            </div>
          )}

          {/* RECORRÊNCIA (Condicional) */}
          {paymentMethod === PaymentMethod.RECURRING && (
            <div className="border-border bg-muted/50 mt-4 space-y-4 rounded-md border p-4">
              {recurringConfigured ? (
                <div className="text-center text-sm font-medium text-zinc-300">
                  Cobrança mensal —{" "}
                  {recurringEndDate
                    ? `até ${format(recurringEndDate, "dd/MM/yyyy")}`
                    : "sem término"}
                </div>
              ) : null}
              <Button
                type="button"
                variant="secondary"
                className="w-full cursor-pointer bg-zinc-800 text-white hover:bg-zinc-700"
                onClick={() => setIsRecurringDialogOpen(true)}
              >
                Configurar Recorrência
              </Button>
              {form.formState.errors.recurringConfigured && (
                <p className="text-destructive text-center text-sm">
                  {form.formState.errors.recurringConfigured.message}
                </p>
              )}
            </div>
          )}

          {/* ERRO GERAL (retornado pela server action) */}
          {form.formState.errors.root && (
            <p className="text-destructive text-sm font-medium">
              {form.formState.errors.root.message}
            </p>
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
              disabled={form.formState.isSubmitting}
              className="bg-primary text-primary-foreground hover:bg-primary/90 w-full cursor-pointer"
            >
              {form.formState.isSubmitting ? "Salvando..." : "Adicionar"}
            </Button>
          </div>
        </form>
      </Form>

      <InstallmentsDialog
        isOpen={isInstallmentsDialogOpen}
        setIsOpen={setIsInstallmentsDialogOpen}
        defaultAmount={amount || 0}
        defaultInstallmentsCount={installments}
        defaultStartDate={date || new Date()}
        initialInstallmentsData={form.getValues("installmentsData")}
        onSave={(data, newAmount, newInstallmentsCount, newStartDate) => {
          form.setValue("installmentsData", data);
          form.setValue("amount", newAmount, { shouldValidate: true });
          form.setValue("installments", newInstallmentsCount, {
            shouldValidate: true,
          });
          form.setValue("date", newStartDate, { shouldValidate: true });
        }}
      />

      <RecurringDialog
        isOpen={isRecurringDialogOpen}
        setIsOpen={setIsRecurringDialogOpen}
        startDate={date || new Date()}
        defaultEndDate={recurringEndDate}
        onSave={(endDate) => {
          form.setValue("recurringEndDate", endDate, {
            shouldValidate: true,
          });
          form.setValue("recurringConfigured", true, {
            shouldValidate: true,
          });
        }}
      />
    </>
  );
}
