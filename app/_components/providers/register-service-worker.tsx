"use client";

import { useEffect } from "react";

/** Registra o service worker (apenas em produção) para habilitar a instalação do PWA. */
export function RegisterServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Falha silenciosa: o app funciona normalmente sem o service worker.
    });
  }, []);

  return null;
}
