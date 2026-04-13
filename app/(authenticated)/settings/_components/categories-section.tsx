import { TagIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/_components/ui/table";

import { CategoryRow } from "../_actions/category-actions";
import { CategoryForm } from "./category-form";
import { DeleteCategoryButton } from "./delete-category-button";
import { EditCategoryDialog } from "./edit-category-dialog";

interface CategoriesSectionProps {
  categories: CategoryRow[];
}

export function CategoriesSection({ categories }: CategoriesSectionProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* FORMULÁRIO */}
      <Card className="border-border bg-card rounded-2xl border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TagIcon className="h-4 w-4" />
            Nova Categoria
          </CardTitle>
          <CardDescription>
            Categorias ajudam a classificar receitas e despesas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CategoryForm />
        </CardContent>
      </Card>

      {/* LISTA */}
      <Card className="border-border bg-card rounded-2xl border shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">
            Categorias ({categories.length})
          </CardTitle>
          <CardDescription>
            Gerencie suas categorias de classificação.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {categories.length === 0 ? (
            <p className="text-muted-foreground p-6 text-center text-sm">
              Nenhuma categoria criada ainda.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-muted-foreground pl-6 font-medium">
                    Cor
                  </TableHead>
                  <TableHead className="text-muted-foreground font-medium">
                    Nome
                  </TableHead>
                  <TableHead className="text-muted-foreground text-center font-medium">
                    Transações
                  </TableHead>
                  <TableHead className="pr-4 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((cat) => (
                  <TableRow key={cat.id} className="border-border/50">
                    <TableCell className="pl-6">
                      <span
                        className="block h-4 w-4 rounded-full"
                        style={{
                          backgroundColor: cat.color ?? "#64748b",
                        }}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{cat.name}</TableCell>
                    <TableCell className="text-muted-foreground text-center">
                      {cat.transactionCount}
                    </TableCell>
                    <TableCell className="pr-4 text-right">
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
        </CardContent>
      </Card>
    </div>
  );
}
