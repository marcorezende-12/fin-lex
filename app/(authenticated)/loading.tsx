// app/(authenticated)/loading.tsx
// Skeleton exibido pelo Next enquanto os Server Components das rotas
// autenticadas (dashboard, transactions, charts, settings) carregam dados.
// Compartilhado entre todas as rotas do grupo — cada página específica pode
// ter seu próprio loading.tsx caso precise de um skeleton mais fiel ao layout.

import { Skeleton } from "@/app/_components/ui/skeleton";

export default function AuthenticatedLoading() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-7 w-40" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Skeleton className="h-[400px] w-full lg:col-span-2" />
        <Skeleton className="h-[400px] w-full" />
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
