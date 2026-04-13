import { getCategories } from "../../settings/_actions/category-actions";
import { getClients } from "../../settings/_actions/client-actions";
import { AddTransactionButton } from "./transaction-dialog";

/**
 * Server Component wrapper que busca categorias e clientes do banco
 * e os passa como props para o AddTransactionButton (Client Component).
 * Dessa forma o formulário de transação tem selects dinâmicos
 * sem expor queries de banco no frontend.
 */
export async function AddTransactionButtonWrapper() {
  const [categoriesResult, clientsResult] = await Promise.all([
    getCategories(),
    getClients(),
  ]);

  const categories = categoriesResult.success
    ? categoriesResult.data.map((c) => ({ value: c.id, label: c.name }))
    : [];

  const clients = clientsResult.success
    ? clientsResult.data.map((c) => ({ value: c.id, label: c.name }))
    : [];

  return <AddTransactionButton categories={categories} clients={clients} />;
}
