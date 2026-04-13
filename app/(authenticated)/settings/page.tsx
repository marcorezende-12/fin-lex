import { getCategories } from "./_actions/category-actions";
import { getClients } from "./_actions/client-actions";
import { SettingsContent } from "./_components/settings-content";

const SettingsPage = async () => {
  const [categoriesResult, clientsResult] = await Promise.all([
    getCategories(),
    getClients(),
  ]);

  const categories = categoriesResult.success ? categoriesResult.data : [];
  const clients = clientsResult.success ? clientsResult.data : [];

  return (
    <div className="flex flex-col gap-6">
      {/* CABEÇALHO */}
      <div>
        <h1 className="text-xl font-bold">Configurações</h1>
        <p className="text-muted-foreground text-sm">
          Gerencie categorias e clientes do sistema
        </p>
      </div>

      {/* CONTEÚDO COM TABS */}
      <div className="border-border bg-card overflow-hidden rounded-2xl border p-6 shadow-sm">
        <SettingsContent categories={categories} clients={clients} />
      </div>
    </div>
  );
};

export default SettingsPage;
