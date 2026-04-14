import { ChevronLeftIcon, FileTextIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/app/_components/ui/button";

const ReceiptsPage = () => {
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
            <FileTextIcon className="text-primary h-5 w-5" />
            <h1 className="text-xl font-bold">Recibos</h1>
          </div>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Configure e emita recibos para seus clientes
          </p>
        </div>
      </div>

      {/* PLACEHOLDER */}
      <div className="border-border bg-card flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-2xl border p-8 shadow-sm">
        <div className="bg-muted flex h-14 w-14 items-center justify-center rounded-2xl">
          <FileTextIcon className="text-muted-foreground h-7 w-7" />
        </div>
        <div className="text-center">
          <p className="font-semibold">Em breve</p>
          <p className="text-muted-foreground mt-1 text-sm">
            A funcionalidade de recibos está sendo desenvolvida.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReceiptsPage;
