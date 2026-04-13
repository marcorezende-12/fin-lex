"use client";

import { useRef, useState, useTransition } from "react";

import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";

import { createCategory } from "../_actions/category-actions";

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

interface CategoryFormProps {
  onSuccess?: () => void;
}

export function CategoryForm({ onSuccess }: CategoryFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("color", selectedColor);

    startTransition(async () => {
      const result = await createCategory(formData);
      if (!result.success) {
        setError(result.error);
        return;
      }
      formRef.current?.reset();
      onSuccess?.();
    });
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      {/* NOME */}
      <div className="space-y-1.5">
        <label htmlFor="cat-name" className="text-sm leading-none font-medium">
          Nome *
        </label>
        <Input
          id="cat-name"
          name="name"
          placeholder="Ex: Honorários, Custas processuais..."
          required
        />
      </div>

      {/* COR */}
      <div className="space-y-2">
        <label className="text-sm leading-none font-medium">Cor</label>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setSelectedColor(color)}
              className="h-7 w-7 cursor-pointer rounded-full transition-transform hover:scale-110 focus:ring-2 focus:ring-offset-2 focus:outline-none"
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

      <Button
        type="submit"
        disabled={isPending}
        className="w-full cursor-pointer"
      >
        {isPending ? "Salvando..." : "Adicionar Categoria"}
      </Button>
    </form>
  );
}
