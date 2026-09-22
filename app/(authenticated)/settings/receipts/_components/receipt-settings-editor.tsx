"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ImageIcon, XIcon } from "lucide-react";
import { type ChangeEvent, useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";

import { ReceiptCard } from "@/app/_components/receipt/receipt-card";
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
import { Textarea } from "@/app/_components/ui/textarea";
import {
  DEFAULT_RECEIPT_TEMPLATE,
  RECEIPT_TOKENS,
  ReceiptTemplateContent,
} from "@/app/_lib/receipt-tokens";

import { saveReceiptTemplate } from "../../_actions/receipt-template-actions";
import {
  ReceiptTemplateInput,
  receiptTemplateSchema,
} from "../_validations/receipt-template-schema";

interface ReceiptSettingsEditorProps {
  template: ReceiptTemplateContent | null;
}

const MAX_LOGO_BYTES = 800 * 1024;
// jsPDF só embute imagens rasterizadas no PDF (ver detectRasterFormat em
// build-receipt-pdf.ts) — um SVG apareceria no preview mas sumiria do PDF.
const ACCEPTED_LOGO_TYPES = ["image/png", "image/jpeg", "image/webp"];

export function ReceiptSettingsEditor({
  template,
}: ReceiptSettingsEditorProps) {
  const initialValues = template ?? DEFAULT_RECEIPT_TEMPLATE;
  const [isPending, startTransition] = useTransition();
  const [logoError, setLogoError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState(false);

  const form = useForm<ReceiptTemplateInput>({
    resolver: zodResolver(receiptTemplateSchema),
    defaultValues: initialValues,
  });

  const preview = useWatch({ control: form.control });

  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!ACCEPTED_LOGO_TYPES.includes(file.type)) {
      setLogoError("Formato não suportado. Use PNG, JPEG ou WEBP.");
      return;
    }

    if (file.size > MAX_LOGO_BYTES) {
      setLogoError("Imagem muito grande, use um arquivo menor que 800KB");
      return;
    }

    setLogoError(null);
    const reader = new FileReader();
    reader.onload = () => {
      form.setValue("logoDataUrl", reader.result as string, {
        shouldDirty: true,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoError(null);
    form.setValue("logoDataUrl", null, { shouldDirty: true });
  };

  const handleCancel = () => {
    setLogoError(null);
    setSavedMessage(false);
    form.reset(initialValues);
  };

  const onSubmit = (data: ReceiptTemplateInput) => {
    setSavedMessage(false);
    startTransition(async () => {
      const result = await saveReceiptTemplate(data);
      if (!result.success) {
        form.setError("root", { message: result.error });
        return;
      }
      form.reset(data);
      setSavedMessage(true);
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-6 lg:grid-cols-2"
      >
        {/* FORMULÁRIO */}
        <div className="border-border bg-card flex flex-col gap-5 rounded-2xl border p-6 shadow-sm">
          {/* LOGO */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Logo</span>
            <div className="flex items-center gap-3">
              {preview.logoDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview.logoDataUrl}
                  alt="Logo"
                  className="h-12 w-12 rounded-md object-cover"
                />
              ) : (
                <div className="bg-muted text-muted-foreground flex h-12 w-12 items-center justify-center rounded-md">
                  <ImageIcon className="h-5 w-5" />
                </div>
              )}
              <label className="text-primary hover:underline">
                <span className="cursor-pointer text-sm font-medium">
                  Enviar imagem
                </span>
                <input
                  type="file"
                  accept={ACCEPTED_LOGO_TYPES.join(",")}
                  className="hidden"
                  onChange={handleLogoChange}
                />
              </label>
              {preview.logoDataUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive cursor-pointer gap-1"
                  onClick={handleRemoveLogo}
                >
                  <XIcon className="h-3.5 w-3.5" />
                  Remover
                </Button>
              )}
            </div>
            {logoError && (
              <p className="text-destructive text-sm">{logoError}</p>
            )}
          </div>

          {/* TÍTULO */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do escritório *</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do escritório" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* SUBTÍTULO */}
          <FormField
            control={form.control}
            name="subtitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subtítulo</FormLabel>
                <FormControl>
                  <Input placeholder="Escritório de Advocacia" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* CORPO */}
          <FormField
            control={form.control}
            name="bodyText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Corpo do recibo *</FormLabel>
                <FormControl>
                  <Textarea rows={8} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* LEGENDA DE TOKENS */}
          <div className="bg-muted/40 border-border rounded-lg border p-3">
            <p className="text-muted-foreground mb-2 text-xs">
              Use os campos abaixo entre chaves no texto do recibo — eles serão
              substituídos automaticamente pelos dados de cada movimentação
              paga.
            </p>
            <div className="grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2">
              {RECEIPT_TOKENS.map(({ token, description }) => (
                <div key={token} className="flex items-baseline gap-1.5">
                  <code className="text-primary text-xs font-semibold">
                    {token}
                  </code>
                  <span className="text-muted-foreground text-xs">
                    {description}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* FECHAMENTO */}
          <FormField
            control={form.control}
            name="closingText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fechamento e assinatura</FormLabel>
                <FormControl>
                  <Textarea rows={3} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* RODAPÉ */}
          <FormField
            control={form.control}
            name="footerText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rodapé (endereço/contato)</FormLabel>
                <FormControl>
                  <Textarea
                    rows={3}
                    name={field.name}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? null : e.target.value,
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.formState.errors.root && (
            <p className="text-destructive text-sm">
              {form.formState.errors.root.message}
            </p>
          )}

          {savedMessage && !form.formState.isDirty && (
            <p className="text-primary text-sm">Recibo salvo com sucesso.</p>
          )}

          {/* AÇÕES */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={handleCancel}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="cursor-pointer"
              disabled={isPending}
            >
              {isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>

        {/* PREVIEW */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <p className="text-muted-foreground mb-3 text-sm font-medium">
            Pré-visualização
          </p>
          <ReceiptCard
            logoDataUrl={preview.logoDataUrl ?? null}
            title={preview.title ?? ""}
            subtitle={preview.subtitle ?? ""}
            bodyText={preview.bodyText ?? ""}
            closingText={preview.closingText ?? ""}
            footerText={preview.footerText ?? null}
          />
        </div>
      </form>
    </Form>
  );
}
