import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const VAPID_PUBLIC_KEY = "BO_lrjJGy9nSOdiN5zsaQwMPZa8ine1JBQiCjrKrNWKFgPt34Bq9YFN0vuaYZS3z0JTEXoG-7nTsQSMBgAQy6Zk";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function usePushSubscription(userId: string | undefined) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const supported = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
    setIsSupported(supported);

    if (supported && userId) {
      // Check current subscription status
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          setIsSubscribed(!!sub);
        });
      });
    }
  }, [userId]);

  const subscribe = useCallback(async () => {
    if (!userId || !isSupported) return false;
    setLoading(true);

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setLoading(false);
        return false;
      }

      const reg = await navigator.serviceWorker.ready;
      
      // Check if already subscribed
      let subscription = await reg.pushManager.getSubscription();
      
      if (!subscription) {
        subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
      }

      const p256dh = arrayBufferToBase64Url(subscription.getKey("p256dh")!);
      const authKey = arrayBufferToBase64Url(subscription.getKey("auth")!);

      // Save to database
      const { error } = await supabase.from("push_subscriptions").upsert(
        {
          user_id: userId,
          endpoint: subscription.endpoint,
          p256dh: p256dh,
          auth_key: authKey,
        },
        { onConflict: "user_id,endpoint" }
      );

      if (error) {
        console.error("Failed to save push subscription:", error);
        setLoading(false);
        return false;
      }

      setIsSubscribed(true);
      setLoading(false);
      return true;
    } catch (err) {
      console.error("Push subscription failed:", err);
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
        await supabase
          .from("push_subscriptions")
          .delete()
          .eq("user_id", userId)
          .eq("endpoint", subscription.endpoint);
      }

      setIsSubscribed(false);
    } catch (err) {
      console.error("Unsubscribe failed:", err);
    }

    setLoading(false);
  }, [userId]);

  return { isSubscribed, isSupported, loading, subscribe, unsubscribe };
}
