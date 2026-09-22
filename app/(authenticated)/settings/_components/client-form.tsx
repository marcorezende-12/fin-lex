"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/app/_components/ui/button";
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
  isValidCpfCnpj,
  maskCpfCnpj,
  onlyDigits,
} from "@/app/_lib/document-validation";

import { createClient } from "../_actions/client-actions";

// ==========================================
// SCHEMA CLIENT-SIDE (espelha o do servidor)
// ==========================================

const clientFormSchema = z.object({
  name: z
    .string()
    .min(1, "O nome é obrigatório")
    .max(120, "Máximo de 120 caracteres"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  phone: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((val) => {
      if (!val || val.trim() === "") return true;
      const digits = onlyDigits(val);
      return digits.length === 10 || digits.length === 11;
    }, "Telefone inválido. Use o formato (XX) XXXXX-XXXX"),
  document: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((val) => {
      if (!val || val.trim() === "") return true;
      return isValidCpfCnpj(val);
    }, "CPF ou CNPJ inválido"),
  notes: z
    .string()
    .max(500, "Máximo de 500 caracteres")
    .optional()
    .or(z.literal("")),
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

// ==========================================
// MÁSCARAS
// ==========================================

function maskPhone(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : "";
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

// ==========================================
// COMPONENTE
// ==========================================

interface ClientFormProps {
  onSuccess?: () => void;
}

export function ClientForm({ onSuccess }: ClientFormProps) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      document: "",
      notes: "",
    },
  });

  const onSubmit = (values: ClientFormValues) => {
    const formData = new FormData();
    formData.set("name", values.name);
    formData.set("email", values.email ?? "");
    formData.set("phone", values.phone ?? "");
    formData.set("document", values.document ?? "");
    formData.set("notes", values.notes ?? "");

    startTransition(async () => {
      const result = await createClient(formData);
      if (!result.success) {
        form.setError("root", { message: result.error });
        return;
      }
      toast.success("Cliente adicionado");
      form.reset();
      onSuccess?.();
    });
  };

  return (
    <Form {...form}>
      <form
        ref={formRef}
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        {/* NOME */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome *</FormLabel>
              <FormControl>
                <Input placeholder="Nome completo do cliente" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* E-MAIL */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="email@exemplo.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* TELEFONE */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl>
                  <Input
                    placeholder="(11) 99999-9999"
                    inputMode="numeric"
                    value={field.value}
                    onChange={(e) => {
                      field.onChange(maskPhone(e.target.value));
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* CPF / CNPJ */}
        <FormField
          control={form.control}
          name="document"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CPF / CNPJ</FormLabel>
              <FormControl>
                <Input
                  placeholder="000.000.000-00 ou 00.000.000/0000-00"
                  inputMode="numeric"
                  value={field.value}
                  onChange={(e) => {
                    field.onChange(maskCpfCnpj(e.target.value));
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* OBSERVAÇÕES */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <textarea
                  rows={3}
                  placeholder="Anotações sobre o cliente..."
                  className="border-input placeholder:text-muted-foreground dark:bg-input/30 focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:opacity-50"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ERRO GERAL (retornado pela server action) */}
        {form.formState.errors.root && (
          <p className="text-destructive text-sm">
            {form.formState.errors.root.message}
          </p>
        )}

        <Button
          type="submit"
          disabled={isPending}
          className="w-full cursor-pointer"
        >
          {isPending ? "Salvando..." : "Adicionar Cliente"}
        </Button>
      </form>
    </Form>
  );
}
