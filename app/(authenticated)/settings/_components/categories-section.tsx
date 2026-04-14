import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/_components/ui/table";

import { CategoryRow } from "../_actions/category-actions";
import { AddCategoryDialog } from "./add-category-dialog";
import { DeleteCategoryButton } from "./delete-category-button";
import { EditCategoryDialog } from "./edit-category-dialog";

interface CategoriesSectionProps {
  categories: CategoryRow[];
}

export function CategoriesSection({ categories }: CategoriesSectionProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* BARRA DE AÇÕES */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {categories.length === 0
            ? "Nenhuma categoria criada"
            : `${categories.length} categoria${categories.length !== 1 ? "s" : ""} cadastrada${categories.length !== 1 ? "s" : ""}`}
        </p>
        <AddCategoryDialog />
      </div>

      {/* TABELA */}
      <div className="border-border bg-card overflow-hidden rounded-2xl border shadow-sm">
        {categories.length === 0 ? (
          <div className="text-muted-foreground flex min-h-[200px] flex-col items-center justify-center gap-2 p-8">
            <p className="text-sm font-medium">Nenhuma categoria criada</p>
            <p className="text-xs">
              Clique em &quot;Nova Categoria&quot; para começar.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-muted-foreground w-12 pl-6 font-medium">
                  Cor
                </TableHead>
                <TableHead className="text-muted-foreground font-medium">
                  Nome
                </TableHead>
                <TableHead className="text-muted-foreground text-center font-medium">
                  Transações
                </TableHead>
                <TableHead className="pr-6 text-right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((cat) => (
                <TableRow key={cat.id} className="border-border/50">
                  <TableCell className="pl-6">
                    <span
                      className="block h-4 w-4 rounded-full"
                      style={{ backgroundColor: cat.color ?? "#64748b" }}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell className="text-muted-foreground text-center">
                    {cat.transactionCount}
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <EditCategoryDialog category={cat} />
                      <DeleteCategoryButton
                        categoryId={cat.id}
                        categoryName={cat.name}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
