import { FileTextIcon } from "lucide-react";
import { memo } from "react";

import {
  ReceiptTokenMap,
  replaceReceiptTokens,
} from "@/app/_lib/receipt-tokens";
import { cn } from "@/app/_lib/utils";

interface ReceiptCardProps {
  logoDataUrl: string | null;
  title: string;
  subtitle: string;
  bodyText: string;
  closingText: string;
  footerText: string | null;
  /** Quando presente, os tokens {token} são substituídos pelos valores reais. Quando ausente, aparecem literalmente (preview do template). */
  tokens?: ReceiptTokenMap;
  className?: string;
}

/**
 * Renderiza o card visual do recibo — usado na pré-visualização ao vivo do editor de template.
 * Memoizado para não re-renderizar quando estados alheios ao preview (ex: isPending, savedMessage
 * do formulário) mudam sem que nenhuma prop realmente tenha mudado.
 */
export const ReceiptCard = memo(function ReceiptCard({
  logoDataUrl,
  title,
  subtitle,
  bodyText,
  closingText,
  footerText,
  tokens,
  className,
}: ReceiptCardProps) {
  const resolvedBody = tokens
    ? replaceReceiptTokens(bodyText, tokens)
    : bodyText;
  const resolvedClosing = tokens
    ? replaceReceiptTokens(closingText, tokens)
    : closingText;
  const signatureName = tokens
    ? (tokens.user_name ?? "{user_name}")
    : "{user_name}";

  return (
    <div
      className={cn(
        "border-border bg-card text-card-foreground w-full rounded-2xl border p-8 shadow-sm",
        className,
      )}
    >
      {/* LOGO */}
      <div className="mb-4">
        {logoDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoDataUrl}
            alt="Logo"
            className="h-10 w-10 rounded-md object-cover"
          />
        ) : (
          <div className="bg-muted text-muted-foreground flex h-10 w-10 items-center justify-center rounded-md">
            <FileTextIcon className="h-5 w-5" />
          </div>
        )}
      </div>

      {/* CABEÇALHO */}
      <div className="text-center">
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>
      </div>

      <div className="border-border my-6 border-t" />

      {/* CORPO */}
      <p className="text-sm leading-relaxed whitespace-pre-wrap">
        {resolvedBody}
      </p>

      {/* FECHAMENTO + ASSINATURA */}
      <p className="mt-6 text-sm leading-relaxed whitespace-pre-wrap">
        {resolvedClosing}
      </p>

      <div className="mt-10 flex flex-col items-center gap-1 text-center">
        <div className="border-border w-56 border-t" />
        <span className="text-sm font-medium">{signatureName}</span>
      </div>

      {/* RODAPÉ */}
      {footerText && (
        <div className="border-border text-muted-foreground mt-8 border-t pt-4 text-center text-xs whitespace-pre-wrap">
          {footerText}
        </div>
      )}
    </div>
  );
});
