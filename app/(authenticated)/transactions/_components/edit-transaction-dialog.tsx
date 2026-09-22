"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, PencilIcon } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/app/_components/ui/button";
import { Calendar } from "@/app/_components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/_components/ui/dialog";
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

import { TransactionRow } from "../_actions/get-transactions";
import { cancelRecurringPlan } from "../_actions/recurring-plan-actions";
import { updateTransaction } from "../_actions/update-transaction";
import {
  PAYMENT_METHOD_OPTIONS,
  SelectOption,
  TYPE_OPTIONS as TRANSACTION_TYPE_OPTIONS,
} from "../_types";

// Schema de edição — idêntico ao transactionSchema mas sem z.coerce no amount,
// pois no modo de edição o valor já chega como number do formulário.
const editTransactionSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório"),
  description: z.string().min(1, "A descrição é obrigatória"),
  amount: z.number().positive("O valor deve ser positivo"),
  type: z.nativeEnum(TransactionType, { message: "Tipo obrigatório" }),
  categoryId: z.string().optional(),
  clientId: z.string().optional(),
  paymentMethod: z.nativeEnum(PaymentMethod, { message: "Método obrigatório" }),
  date: z.date({ message: "A data é obrigatória" }),
});

type EditTransactionValues = z.infer<typeof editTransactionSchema>;

interface EditTransactionDialogProps {
  transaction: TransactionRow;
  categories?: SelectOption[];
  clients?: SelectOption[];
}

export function EditTransactionDialog({
  transaction,
  categories = [],
  clients = [],
}: EditTransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isCancellingRecurring, setIsCancellingRecurring] = useState(false);
  const [isCancelPending, startCancelTransition] = useTransition();

  const buildDefaultValues = (): EditTransactionValues => ({
    name: transaction.name,
    description: transaction.description ?? "",
    amount: transaction.amountInCents / 100,
    type: transaction.type,
    paymentMethod: transaction.paymentMethod,
    date: new Date(transaction.dueDate),
    categoryId: transaction.categoryId ?? undefined,
    clientId: transaction.clientId ?? undefined,
  });

  const form = useForm<EditTransactionValues>({
    resolver: zodResolver(editTransactionSchema),
    defaultValues: buildDefaultValues(),
  });

  const onSubmit = (data: EditTransactionValues) => {
    startTransition(async () => {
      const result = await updateTransaction(transaction.id, data);
      if (!result.success) {
        form.setError("root", { message: result.error });
        return;
      }
      toast.success("Movimentação atualizada");
      setOpen(false);
    });
  };

  const handleOpenChange = (next: boolean) => {
    if (next) {
      form.reset({
        name: transaction.name,
        description: transaction.description ?? "",
        amount: transaction.amountInCents / 100,
        type: transaction.type,
        paymentMethod: transaction.paymentMethod,
        date: new Date(transaction.dueDate),
        categoryId: transaction.categoryId ?? undefined,
        clientId: transaction.clientId ?? undefined,
      });
      setIsCancellingRecurring(false);
    }
    setOpen(next);
  };

  const handleCancelRecurring = () => {
    startCancelTransition(async () => {
      const result = await cancelRecurringPlan(transaction.recurringPlanId!);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Recorrência encerrada");
      setIsCancellingRecurring(false);
      setOpen(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground h-8 w-8 cursor-pointer rounded-full"
          aria-label={`Editar movimentação ${transaction.name}`}
        >
          <PencilIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Movimentação</DialogTitle>
          <DialogDescription>
            Atualize os dados da movimentação. Parcelamentos e recorrências são
            gerenciados individualmente em cada ocorrência.
          </DialogDescription>
        </DialogHeader>

        {/* RECORRÊNCIA — encerrar a série a partir daqui. Confirmação
            inline (não um Dialog aninhado): abrir um segundo Dialog
            dentro deste trava a página inteira depois de fechar o
            interno (bug conhecido de Dialogs do Radix aninhados). */}
        {transaction.recurringPlanId && (
          <div className="border-border bg-muted/50 space-y-2 rounded-md border p-3">
            {isCancellingRecurring ? (
              <>
                <p className="text-sm">
                  Encerrar esta recorrência? Nenhuma cobrança futura será gerada
                  a partir de agora. Ocorrências já pagas ou já vencidas
                  continuam no histórico — apenas as pendentes com vencimento
                  futuro serão removidas.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCancellingRecurring(false)}
                    disabled={isCancelPending}
                    className="cursor-pointer"
                  >
                    Voltar
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleCancelRecurring}
                    disabled={isCancelPending}
                    className="cursor-pointer"
                  >
                    {isCancelPending ? "Encerrando..." : "Confirmar"}
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <p className="text-muted-foreground text-sm">
                  Parte de uma recorrência mensal.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive cursor-pointer"
                  onClick={() => setIsCancellingRecurring(true)}
                >
                  Encerrar recorrência
                </Button>
              </div>
            )}
          </div>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 pt-2"
          >
            {/* NOME */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome da movimentação" {...field} />
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
                    <Input placeholder="Descrição da movimentação" {...field} />
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
                      placeholder="R$ 0,00"
                      inputMode="numeric"
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
                        field.onChange(Number(rawValue) / 100);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* TIPO + MÉTODO — linha dupla */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full cursor-pointer">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TRANSACTION_TYPE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pagamento *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full cursor-pointer">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PAYMENT_METHOD_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* DATA */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data de vencimento *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full cursor-pointer pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: ptBR })
                          ) : (
                            <span>Selecionar data</span>
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

            {form.formState.errors.root && (
              <p className="text-destructive text-sm font-medium">
                {form.formState.errors.root.message}
              </p>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="cursor-pointer"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="cursor-pointer"
              >
                {isPending ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
