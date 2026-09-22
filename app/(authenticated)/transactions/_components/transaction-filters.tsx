"use client";

import { SearchIcon, XIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef, useState } from "react";

import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";

import {
  PAYMENT_METHOD_OPTIONS,
  STATUS_OPTIONS,
  TYPE_OPTIONS,
} from "../_types";

const ALL_VALUE = "all";

export function TransactionFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  const search = searchParams.get("search") ?? "";
  const type = searchParams.get("type") ?? "";
  const status = searchParams.get("status") ?? "";
  const paymentMethod = searchParams.get("paymentMethod") ?? "";

  // Estado local controlado para o campo de busca —
  // assim o botão de lupa consegue ler o valor atual sem depender de blur
  const [localSearch, setLocalSearch] = useState(search);

  const hasActiveFilters = search || type || status || paymentMethod;

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== ALL_VALUE) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  const commitSearch = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) {
        params.set("search", value.trim());
      } else {
        params.delete("search");
      }
      router.push(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  const clearFilters = () => {
    setLocalSearch("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    params.delete("type");
    params.delete("status");
    params.delete("paymentMethod");
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="grid grid-cols-2 gap-3 md:flex md:flex-wrap md:items-center">
      {/* BUSCA TEXTUAL com botão de lupa */}
      <div className="relative col-span-2 min-w-[200px] flex-1">
        <Input
          ref={inputRef}
          placeholder="Buscar por nome ou descrição..."
          value={localSearch}
          className="pr-10"
          onChange={(e) => {
            const value = e.target.value;
            setLocalSearch(value);
            // Limpa a busca imediatamente se o campo for esvaziado
            if (value === "") commitSearch("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              commitSearch(localSearch);
            }
          }}
        />
        <button
          type="button"
          onClick={() => commitSearch(localSearch)}
          className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer transition-colors"
          aria-label="Buscar"
        >
          <SearchIcon className="h-4 w-4" />
        </button>
      </div>

      {/* TIPO */}
      <Select
        value={type || ALL_VALUE}
        onValueChange={(v) => updateParam("type", v)}
      >
        <SelectTrigger className="w-full cursor-pointer md:w-[140px]">
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>Todos os tipos</SelectItem>
          {TYPE_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* STATUS */}
      <Select
        value={status || ALL_VALUE}
        onValueChange={(v) => updateParam("status", v)}
      >
        <SelectTrigger className="w-full cursor-pointer md:w-[140px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>Todos os status</SelectItem>
          {STATUS_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* MÉTODO DE PAGAMENTO */}
      <Select
        value={paymentMethod || ALL_VALUE}
        onValueChange={(v) => updateParam("paymentMethod", v)}
      >
        <SelectTrigger className="col-span-2 w-full cursor-pointer md:col-span-1 md:w-[160px]">
          <SelectValue placeholder="Pagamento" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>Todos os métodos</SelectItem>
          {PAYMENT_METHOD_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* LIMPAR FILTROS */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-muted-foreground hover:text-foreground col-span-2 cursor-pointer gap-1"
        >
          <XIcon className="h-4 w-4" />
          Limpar filtros
        </Button>
      )}
    </div>
  );
}
