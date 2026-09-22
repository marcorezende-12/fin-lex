import { ClientRow } from "../_actions/client-actions";
import { DeleteClientButton } from "./delete-client-button";
import { EditClientDialog } from "./edit-client-dialog";

interface ClientCardProps {
  client: ClientRow;
}

/**
 * Versão mobile (< md) de uma linha da tabela de clientes: os dados de contato
 * ficam empilhados e as ações sempre visíveis, sem scroll horizontal.
 */
export function ClientCard({ client }: ClientCardProps) {
  const details = [
    { label: "E-mail", value: client.email },
    { label: "Telefone", value: client.phone },
    { label: "CPF/CNPJ", value: client.document },
  ].filter((detail) => detail.value);

  return (
    <li className="flex flex-col gap-2 p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 flex-1 font-medium break-words">{client.name}</p>
        <span className="bg-muted text-muted-foreground shrink-0 rounded-full px-2 py-0.5 text-xs font-medium">
          {client.transactionCount}{" "}
          {client.transactionCount === 1 ? "transação" : "transações"}
        </span>
      </div>

      {details.length > 0 && (
        <dl className="text-muted-foreground flex flex-col gap-0.5 text-sm">
          {details.map(({ label, value }) => (
            <div key={label} className="flex gap-2">
              <dt className="shrink-0">{label}:</dt>
              <dd className="min-w-0 break-words">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="border-border/50 -mb-1 flex items-center justify-end gap-2 border-t pt-2">
        <EditClientDialog client={client} />
        <DeleteClientButton clientId={client.id} clientName={client.name} />
      </div>
    </li>
  );
}
