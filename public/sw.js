// Service worker mínimo, só para o app ser instalável (PWA).
// Propositalmente NÃO faz cache: o app é autenticado e financeiro, então
// servir páginas ou dados antigos seria pior do que exigir rede.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {
  // Sem respondWith: o navegador segue com o fluxo de rede normal.
});
