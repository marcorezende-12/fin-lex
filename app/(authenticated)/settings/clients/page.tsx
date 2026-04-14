import { ChevronLeftIcon, UserIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/app/_components/ui/button";

import { getClients } from "../_actions/client-actions";
import { ClientsSection } from "../_components/clients-section";

const ClientsPage = async () => {
  const result = await getClients();
  const clients = result.success ? result.data : [];

  return (
    <div className="flex flex-col gap-6">
      {/* CABEÇALHO */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="cursor-pointer rounded-xl"
        >
          <Link href="/settings">
            <ChevronLeftIcon className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <UserIcon className="text-primary h-5 w-5" />
            <h1 className="text-xl font-bold">Clientes</h1>
          </div>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Gerencie clientes e vincule-os às movimentações financeiras
          </p>
        </div>
      </div>

      <ClientsSection clients={clients} />
    </div>
  );
};

export default ClientsPage;
