import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const VAPID_PUBLIC_KEY = "BO_lrjJGy9nSOdiN5zsaQwMPZa8ine1JBQiCjrKrNWKFgPt34Bq9YFN0vuaYZS3z0JTEXoG-7nTsQSMBgAQy6Zk";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function deviceInfo() {
  const ua = navigator.userAgent;
  return {
    userAgent: ua,
    platform: navigator.platform,
    standalone: window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone === true,
    isAndroid: /Android/i.test(ua),
    isIOS: /iPhone|iPad|iPod/i.test(ua),
    savedAt: new Date().toISOString(),
  };
}

export function usePushSubscription(userId: string | undefined) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastEndpoint, setLastEndpoint] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const supported = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
    setIsSupported(supported);
    if (!supported || !userId) return;

    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => {
        setIsSubscribed(!!sub);
        setLastEndpoint(sub?.endpoint ?? null);
      })
      .catch((err) => setLastError(err instanceof Error ? err.message : String(err)));
  }, [userId]);

  const subscribe = useCallback(async () => {
    if (!userId || !isSupported) return false;
    setLoading(true);
    setLastError(null);

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setLastError(`Permissão atual: ${permission}`);
        setLoading(false);
        return false;
      }

      const reg = await navigator.serviceWorker.ready;
      let subscription = await reg.pushManager.getSubscription();
      if (!subscription) {
        subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY).buffer as ArrayBuffer,
        });
      }

      const p256dh = subscription.getKey("p256dh");
      const auth = subscription.getKey("auth");
      if (!p256dh || !auth) throw new Error("Chaves do token push não foram geradas pelo navegador.");

      const payload = {
        user_id: userId,
        endpoint: subscription.endpoint,
        p256dh: arrayBufferToBase64Url(p256dh),
        auth_key: arrayBufferToBase64Url(auth),
        permission_status: Notification.permission,
        fcm_endpoint: subscription.endpoint.includes("fcm.googleapis.com"),
        device_info: deviceInfo(),
        last_saved_at: new Date().toISOString(),
        last_error: null,
      };

      const { error } = await supabase.from("push_subscriptions" as any).upsert(payload, { onConflict: "user_id,endpoint" });
      if (error) throw error;

      console.info("[push] Token gerado/salvo", { endpoint: subscription.endpoint, ...payload.device_info });
      setLastEndpoint(subscription.endpoint);
      setIsSubscribed(true);
      setLoading(false);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("[push] Falha ao gerar/salvar token", err);
      setLastError(message);
      setLoading(false);
      return false;
    }
  }, [userId, isSupported]);

  const unsubscribe = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        await supabase.from("push_subscriptions").delete().eq("user_id", userId).eq("endpoint", subscription.endpoint);
      }
      setIsSubscribed(false);
      setLastEndpoint(null);
    } catch (err) {
      setLastError(err instanceof Error ? err.message : String(err));
    }
    setLoading(false);
  }, [userId]);

  return { isSubscribed, isSupported, loading, subscribe, unsubscribe, lastEndpoint, lastError };
}
