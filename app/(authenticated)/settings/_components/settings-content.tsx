"use client";

import { TagIcon, UserIcon } from "lucide-react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/_components/ui/tabs";

import { CategoryRow } from "../_actions/category-actions";
import { ClientRow } from "../_actions/client-actions";
import { CategoriesSection } from "./categories-section";
import { ClientsSection } from "./clients-section";

interface SettingsContentProps {
  categories: CategoryRow[];
  clients: ClientRow[];
}

export function SettingsContent({ categories, clients }: SettingsContentProps) {
  return (
    <Tabs defaultValue="categories">
      <TabsList
        variant="line"
        className="mb-6 h-auto w-full justify-start rounded-none border-b pb-0"
      >
        <TabsTrigger value="categories" className="gap-2 pb-3">
          <TagIcon className="h-4 w-4" />
          Categorias
          <span className="bg-muted text-muted-foreground ml-1 rounded-full px-2 py-0.5 text-xs font-medium">
            {categories.length}
          </span>
        </TabsTrigger>
        <TabsTrigger value="clients" className="gap-2 pb-3">
          <UserIcon className="h-4 w-4" />
          Clientes
          <span className="bg-muted text-muted-foreground ml-1 rounded-full px-2 py-0.5 text-xs font-medium">
            {clients.length}
          </span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="categories">
        <CategoriesSection categories={categories} />
      </TabsContent>

      <TabsContent value="clients">
        <ClientsSection clients={clients} />
      </TabsContent>
    </Tabs>
  );
}
