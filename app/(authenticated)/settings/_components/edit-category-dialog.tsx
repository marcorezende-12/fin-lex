"use client";

import { PencilIcon } from "lucide-react";
import { useRef, useState, useTransition } from "react";

import { Button } from "@/app/_components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/_components/ui/dialog";
import { Input } from "@/app/_components/ui/input";

import { CategoryRow, updateCategory } from "../_actions/category-actions";

const PRESET_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#64748b",
];

interface EditCategoryDialogProps {
  category: CategoryRow;
}

export function EditCategoryDialog({ category }: EditCategoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState(
    category.color ?? PRESET_COLORS[0],
  );
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("color", selectedColor);

    startTransition(async () => {
      const result = await updateCategory(category.id, formData);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setOpen(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground h-8 w-8 cursor-pointer rounded-full"
          aria-label={`Editar categoria ${category.name}`}
        >
          <PencilIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Editar Categoria</DialogTitle>
          <DialogDescription>
            Altere o nome ou a cor da categoria.
          </DialogDescription>
        </DialogHeader>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="edit-cat-name"
              className="text-sm leading-none font-medium"
            >
              Nome *
            </label>
            <Input
              id="edit-cat-name"
              name="name"
              defaultValue={category.name}
              placeholder="Nome da categoria"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm leading-none font-medium">Cor</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className="h-7 w-7 cursor-pointer rounded-full transition-transform hover:scale-110 focus:outline-none"
                  style={{
                    backgroundColor: color,
                    boxShadow:
                      selectedColor === color
                        ? `0 0 0 3px white, 0 0 0 5px ${color}`
                        : undefined,
                  }}
                  aria-label={`Selecionar cor ${color}`}
                />
              ))}
            </div>
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
              className="cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="cursor-pointer"
            >
              {isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
