"use client";

// app/global-error.tsx
// Único error boundary que também cobre falhas no root layout (ClerkProvider,
// ThemeProvider, etc). Por isso precisa definir <html>/<body> própria e evita
// depender de providers ou de componentes que possam ter causado o erro.

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body
        style={{
          display: "flex",
          minHeight: "100dvh",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          fontFamily: "system-ui, sans-serif",
          background: "#0a0a0a",
          color: "#fafafa",
        }}
      >
        <div style={{ maxWidth: 420, textAlign: "center" }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
            Algo deu errado
          </h1>
          <p style={{ opacity: 0.7, marginBottom: 20, fontSize: 14 }}>
            Ocorreu um erro inesperado ao carregar o aplicativo. Tente
            novamente.
          </p>
          <button
            onClick={reset}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              background: "#fafafa",
              color: "#0a0a0a",
              border: "none",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  );
}
