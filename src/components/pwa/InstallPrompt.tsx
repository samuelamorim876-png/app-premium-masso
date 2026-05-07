import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Download, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    globalDeferredPrompt = e as BeforeInstallPromptEvent;
  });
}

function useInstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(globalDeferredPrompt);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    setIsStandalone(
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone === true
    );

    const handler = (e: Event) => {
      e.preventDefault();
      globalDeferredPrompt = e as BeforeInstallPromptEvent;
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = useCallback(async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        globalDeferredPrompt = null;
        setDeferredPrompt(null);
      }
      return outcome === "accepted";
    }
    return false;
  }, [deferredPrompt]);

  return { canInstallNative: !!deferredPrompt, isStandalone, install };
}

/** Compact banner for the login page — no popups */
export function InstallBanner() {
  const { canInstallNative, isStandalone, install } = useInstallPWA();

  if (isStandalone) return null;

  return (
    <div className="rounded-xl border border-primary/30 bg-primary/10 p-4 mt-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/20">
          <Smartphone className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground leading-snug">
            Instale o app para acesso rápido direto do seu celular.
          </p>
        </div>
        {canInstallNative && (
          <Button size="sm" className="shrink-0 gap-1.5" onClick={() => install()}>
            <Download className="h-3.5 w-3.5" />
            Instalar App
          </Button>
        )}
      </div>
      <div className="mt-3 space-y-1.5 text-xs text-muted-foreground border-t border-primary/20 pt-3">
        <p className="font-medium text-foreground/80">2ª opção de instalação:</p>
        <p>📱 <strong>Android:</strong> Clique nos <span className="inline-block px-1 py-0.5 rounded bg-muted text-foreground/70 font-mono">⋮</span> pontos no canto superior direito e procure por <strong>"Adicionar à tela inicial"</strong></p>
        <p>🍎 <strong>iPhone:</strong> Clique em compartilhar e depois <strong>"Adicionar à Tela de Início"</strong></p>
      </div>
    </div>
  );
}
