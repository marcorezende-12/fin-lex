import { ChevronLeftIcon, TagIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/app/_components/ui/button";

import { getCategories } from "../_actions/category-actions";
import { CategoriesSection } from "../_components/categories-section";

const CategoriesPage = async () => {
  const result = await getCategories();
  const categories = result.success ? result.data : [];

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
            <TagIcon className="text-primary h-5 w-5" />
            <h1 className="text-xl font-bold">Categorias</h1>
          </div>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Classifique suas movimentações financeiras
          </p>
        </div>
      </div>

      <CategoriesSection categories={categories} />
    </div>
  );
};

export default CategoriesPage;
