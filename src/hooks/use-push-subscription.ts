import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchFcmToken, listenForegroundMessages } from "@/lib/firebase-client";

function deviceInfo() {
  const ua = navigator.userAgent;
  return {
    userAgent: ua,
    platform: navigator.platform,
    language: navigator.language,
    standalone: window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone === true,
    isAndroid: /Android/i.test(ua),
    isIOS: /iPhone|iPad|iPod/i.test(ua),
    savedAt: new Date().toISOString(),
  };
}

function deviceLabel() {
  const ua = navigator.userAgent;
  if (/Android/i.test(ua)) return "Android";
  if (/iPhone|iPad|iPod/i.test(ua)) return "iOS";
  if (/Macintosh/i.test(ua)) return "Mac";
  if (/Windows/i.test(ua)) return "Windows";
  return "Web";
}

export function usePushSubscription(userId: string | undefined) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastToken, setLastToken] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const supported = "serviceWorker" in navigator && "Notification" in window && "PushManager" in window;
    setIsSupported(supported);
    if (!supported || !userId) return;

    supabase
      .from("push_subscriptions" as any)
      .select("fcm_token")
      .eq("user_id", userId)
      .not("fcm_token", "is", null)
      .limit(1)
      .maybeSingle()
      .then(({ data }: any) => {
        if (data?.fcm_token) {
          setIsSubscribed(true);
          setLastToken(data.fcm_token);
        }
      });

    // Listen for foreground messages so the admin sees notifications even with the app open.
    let unsub: (() => void) | null = null;
    listenForegroundMessages((payload) => {
      console.log("[fcm] Foreground:", payload);
      try {
        const title = payload?.notification?.title ?? payload?.data?.title ?? "Notificação";
        const body = payload?.notification?.body ?? payload?.data?.body ?? "";
        new Notification(title, {
          body,
          icon: "/icon-192.png",
          data: payload?.data ?? {},
        });
      } catch (e) {
        console.warn("[fcm] Não foi possível mostrar notificação foreground:", e);
      }
    }).then((u) => {
      unsub = u;
    });

    return () => {
      if (unsub) unsub();
    };
  }, [userId]);

  const subscribe = useCallback(async () => {
    if (!userId || !isSupported) return false;
    setLoading(true);
    setLastError(null);

    try {
      const permission = await Notification.requestPermission();
      console.info("[fcm] Permissão:", permission);
      if (permission !== "granted") {
        setLastError(`Permissão negada (${permission})`);
        setLoading(false);
        return false;
      }

      const { token, error } = await fetchFcmToken();
      if (!token) {
        setLastError(error ?? "no_token");
        setLoading(false);
        return false;
      }

      const payload = {
        user_id: userId,
        endpoint: token, // reuse endpoint column to keep unique constraint working
        fcm_token: token,
        p256dh: "fcm",
        auth_key: "fcm",
        permission_status: Notification.permission,
        fcm_endpoint: true,
        platform: "fcm_web",
        device_label: deviceLabel(),
        device_info: deviceInfo(),
        last_saved_at: new Date().toISOString(),
        last_error: null,
      };

      const { error: dbError } = await supabase
        .from("push_subscriptions" as any)
        .upsert(payload, { onConflict: "user_id,endpoint" });
      if (dbError) throw dbError;

      console.info("[fcm] Token salvo no banco para o admin");
      setLastToken(token);
      setIsSubscribed(true);
      setLoading(false);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("[fcm] Falha ao salvar token", err);
      setLastError(message);
      setLoading(false);
      return false;
    }
  }, [userId, isSupported]);

  const unsubscribe = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      if (lastToken) {
        await supabase.from("push_subscriptions").delete().eq("user_id", userId).eq("endpoint", lastToken);
      } else {
        await supabase.from("push_subscriptions").delete().eq("user_id", userId);
      }
      setIsSubscribed(false);
      setLastToken(null);
    } catch (err) {
      setLastError(err instanceof Error ? err.message : String(err));
    }
    setLoading(false);
  }, [userId, lastToken]);

  return { isSubscribed, isSupported, loading, subscribe, unsubscribe, lastEndpoint: lastToken, lastError };
}
