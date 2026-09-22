/** Formato padrão de retorno das server actions. */
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
