import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, X } from "lucide-react";

/**
 * Shows a banner when a new version of the PWA is available.
 * Works with vite-plugin-pwa in "prompt" registerType.
 */
export function UpdatePrompt() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    // Listen for the controlling service worker change
    let refreshing = false;
    const onControllerChange = () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    // Check for waiting service worker on current registration
    const checkForUpdate = async () => {
      const reg = await navigator.serviceWorker.getRegistration();
      if (!reg) return;

      setRegistration(reg);

      if (reg.waiting) {
        setNeedRefresh(true);
        return;
      }

      // Listen for new service worker installation
      reg.addEventListener("updatefound", () => {
        const newSW = reg.installing;
        if (!newSW) return;

        newSW.addEventListener("statechange", () => {
          if (newSW.state === "installed" && navigator.serviceWorker.controller) {
            setNeedRefresh(true);
          }
        });
      });
    };

    checkForUpdate();

    // Also periodically check for updates (every 60 minutes)
    const interval = setInterval(() => {
      navigator.serviceWorker.getRegistration().then((reg) => {
        reg?.update();
      });
    }, 60 * 60 * 1000);

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
      clearInterval(interval);
    };
  }, []);

  const updateApp = useCallback(() => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
    }
  }, [registration]);

  const dismiss = useCallback(() => {
    setNeedRefresh(false);
  }, []);

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md animate-fade-up">
      <div className="rounded-xl border border-amber-500/30 bg-card/95 backdrop-blur-xl p-4 shadow-2xl shadow-black/40">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/20">
            <RefreshCw className="h-5 w-5 text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">
              Uma nova atualização do aplicativo está disponível.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Atualize para ter acesso às últimas melhorias.
            </p>
          </div>
          <button
            onClick={dismiss}
            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <Button
          className="w-full mt-3 bg-amber-500 hover:bg-amber-600 text-black font-bold gap-2"
          onClick={updateApp}
        >
          <RefreshCw className="h-4 w-4" />
          Atualizar Aplicativo
        </Button>
      </div>
    </div>
  );
}
