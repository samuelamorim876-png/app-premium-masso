import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Download, X, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;

// Listen globally so we never miss the event
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    globalDeferredPrompt = e as BeforeInstallPromptEvent;
  });
}

function useInstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(globalDeferredPrompt);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    setIsStandalone(
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone === true
    );
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream);

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

  return { canInstallNative: !!deferredPrompt, isIOS, isStandalone, install };
}

function ManualInstructions({ isIOS }: { isIOS: boolean }) {
  return (
    <div className="text-xs text-muted-foreground space-y-1.5 mt-3 p-3 rounded-lg bg-muted/50">
      {isIOS ? (
        <>
          <p className="font-medium text-foreground/80">📱 iPhone / iPad (Safari):</p>
          <p>1. Toque no botão de compartilhamento <span className="inline-block px-1.5 py-0.5 rounded bg-muted text-foreground/70 font-mono">⬆</span></p>
          <p>2. Selecione <strong>"Adicionar à Tela de Início"</strong></p>
        </>
      ) : (
        <>
          <p className="font-medium text-foreground/80">📱 Android / Chrome:</p>
          <p>1. Toque nos <span className="inline-block px-1.5 py-0.5 rounded bg-muted text-foreground/70 font-mono">⋮</span> três pontinhos no canto superior direito</p>
          <p>2. Selecione <strong>"Adicionar à tela inicial"</strong></p>
        </>
      )}
    </div>
  );
}

/** Full-screen pop-up shown on first visit */
export function InstallPopup() {
  const { canInstallNative, isIOS, isStandalone, install } = useInstallPWA();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isStandalone) return;
    const dismissed = sessionStorage.getItem("pwa-popup-dismissed");
    if (!dismissed) {
      const t = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(t);
    }
  }, [isStandalone]);

  if (!visible || isStandalone) return null;

  const dismiss = () => {
    setVisible(false);
    sessionStorage.setItem("pwa-popup-dismissed", "1");
  };

  const handleInstall = async () => {
    const accepted = await install();
    if (accepted) dismiss();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl animate-scale-in">
        <button onClick={dismiss} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground" aria-label="Fechar">
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20 border border-primary/30">
            <Smartphone className="h-8 w-8 text-primary" />
          </div>

          <h3 className="font-heading text-xl font-bold text-foreground">Instale o aplicativo</h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Para uma melhor experiência, instale o aplicativo no seu celular e tenha acesso mais rápido e como um app nativo.
          </p>

          <div className="mt-5 flex w-full flex-col gap-2">
            {canInstallNative ? (
              <Button size="lg" className="w-full gap-2" onClick={handleInstall}>
                <Download className="h-4 w-4" />
                Instalar App
              </Button>
            ) : (
              <>
                <ManualInstructions isIOS={isIOS} />
              </>
            )}
            <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={dismiss}>
              Agora não
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Compact banner for the login page */
export function InstallBanner() {
  const { canInstallNative, isIOS, isStandalone, install } = useInstallPWA();
  const [showManual, setShowManual] = useState(false);

  if (isStandalone) return null;

  const handleClick = async () => {
    if (canInstallNative) {
      await install();
    } else {
      setShowManual((v) => !v);
    }
  };

  return (
    <div className="rounded-xl border border-primary/30 bg-primary/10 p-4 mt-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/20">
          <Smartphone className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground leading-snug">
            Melhore sua experiência instalando o aplicativo no seu celular.
          </p>
        </div>
        <Button size="sm" className="shrink-0 gap-1.5" onClick={handleClick}>
          <Download className="h-3.5 w-3.5" />
          Instalar App
        </Button>
      </div>
      {showManual && <ManualInstructions isIOS={isIOS} />}
    </div>
  );
}
