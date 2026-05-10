import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported, type Messaging } from "firebase/messaging";
import { getFirebaseWebConfig } from "@/lib/firebase-config.functions";

let appPromise: Promise<{ app: FirebaseApp; messaging: Messaging | null; vapidKey: string | null } | null> | null = null;

export async function getFirebaseClient() {
  if (appPromise) return appPromise;
  appPromise = (async () => {
    if (typeof window === "undefined") return null;
    const supported = await isSupported().catch(() => false);
    if (!supported) {
      console.warn("[fcm] Firebase Messaging não é suportado neste navegador.");
      return null;
    }
    const cfgRes = (await getFirebaseWebConfig()) as any;
    if (!cfgRes?.ok) {
      console.error("[fcm] Falha ao obter Firebase web config:", cfgRes);
      return null;
    }
    const app = getApps()[0] ?? initializeApp(cfgRes.config);
    const messaging = getMessaging(app);
    return { app, messaging, vapidKey: cfgRes.vapidKey };
  })();
  return appPromise;
}

export async function fetchFcmToken(): Promise<{ token: string | null; error?: string; vapidKey?: string | null }> {
  const fb = await getFirebaseClient();
  if (!fb || !fb.messaging) return { token: null, error: "firebase_not_initialized" };
  if (!fb.vapidKey) return { token: null, error: "missing_vapid_key" };
  try {
    // Make sure the FCM service worker is registered at /firebase-messaging-sw.js
    const swReg = await navigator.serviceWorker.register("/firebase-messaging-sw.js", { scope: "/firebase-cloud-messaging-push-scope" });
    const token = await getToken(fb.messaging, { vapidKey: fb.vapidKey, serviceWorkerRegistration: swReg });
    if (!token) return { token: null, error: "no_token_returned" };
    console.info("[fcm] Token gerado:", token.slice(0, 24) + "…");
    return { token, vapidKey: fb.vapidKey };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[fcm] Falha ao obter token:", err);
    return { token: null, error: msg };
  }
}

export async function listenForegroundMessages(handler: (payload: any) => void) {
  const fb = await getFirebaseClient();
  if (!fb || !fb.messaging) return () => {};
  return onMessage(fb.messaging, handler);
}
