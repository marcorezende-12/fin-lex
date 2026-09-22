import { ChevronLeftIcon, FileTextIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/app/_components/ui/button";

import { getReceiptTemplate } from "../_actions/receipt-template-actions";
import { ReceiptSettingsEditor } from "./_components/receipt-settings-editor";

const ReceiptsPage = async () => {
  const result = await getReceiptTemplate();
  const template = result.success ? result.data : null;

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

      <ReceiptSettingsEditor template={template} />
    </div>
  );
};

export default ReceiptsPage;
