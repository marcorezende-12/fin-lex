import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Defina quais rotas são públicas (que NÃO exigem login)
const isPublicRoute = createRouteMatcher([
  "/",
  "/api/webhooks(.*)",
  // Chamada pela rotina de cron da Vercel (sem sessão de usuário) — a
  // própria rota valida o header Authorization com CRON_SECRET.
  "/api/cron(.*)",
  "/login(.*)",
  "/signup(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // Se a rota NÃO for pública, ela é protegida!
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

// A configuração do Next.js para aplicar o middleware nas rotas corretas
export const config = {
  matcher: [
    // Pula os arquivos internos do Next.js e arquivos estáticos (CSS, imagens, fontes, etc)
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Sempre roda em rotas da API (trpc, etc)
    "/(api|trpc)(.*)",
  ],
};
