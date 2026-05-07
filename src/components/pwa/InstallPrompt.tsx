import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, X, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches
      || (navigator as any).standalone === true;
    setIsStandalone(standalone);

    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (isStandalone || dismissed) return null;

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setDismissed(true);
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="relative rounded-xl border border-primary/30 bg-primary/10 backdrop-blur-sm p-4 mt-6">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
        aria-label="Fechar"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/20">
          <Smartphone className="h-5 w-5 text-primary" />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">
            📱 Para uma melhor experiência, instale o aplicativo no seu celular
          </p>

          {deferredPrompt ? (
            <Button size="sm" onClick={handleInstall} className="gap-2">
              <Download className="h-4 w-4" />
              Instalar App
            </Button>
          ) : (
            <div className="text-xs text-muted-foreground space-y-1.5">
              {isIOS ? (
                <>
                  <p className="font-medium text-foreground/80">iPhone / iPad (Safari):</p>
                  <p>1. Toque no botão de compartilhamento <span className="inline-block px-1 rounded bg-muted">⬆</span></p>
                  <p>2. Selecione <strong>"Adicionar à Tela de Início"</strong></p>
                </>
              ) : (
                <>
                  <p className="font-medium text-foreground/80">Android / Chrome:</p>
                  <p>1. Toque nos <span className="inline-block px-1 rounded bg-muted">⋮</span> três pontinhos no canto superior direito</p>
                  <p>2. Selecione <strong>"Adicionar à tela inicial"</strong></p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
