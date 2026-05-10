import { createServerFn } from "@tanstack/react-start";

/**
 * Returns the PUBLIC Firebase web config (apiKey, projectId, messagingSenderId, appId, etc).
 * These values are not secret — they are designed to be embedded in client apps.
 * We just store them server-side so the user can paste once and we can read at runtime.
 */
export const getFirebaseWebConfig = createServerFn({ method: "GET" }).handler(async () => {
  const raw = process.env.FIREBASE_WEB_CONFIG_JSON;
  if (!raw) return { ok: false as const, reason: "missing_FIREBASE_WEB_CONFIG_JSON" };
  try {
    const cfg = JSON.parse(raw);
    if (!cfg.apiKey || !cfg.projectId || !cfg.appId || !cfg.messagingSenderId) {
      return { ok: false as const, reason: "incomplete_config", missing: ["apiKey", "projectId", "appId", "messagingSenderId"].filter((k) => !cfg[k]) };
    }
    // VAPID public key (from Firebase Console → Cloud Messaging → Web Push certificates)
    const vapidKey = cfg.vapidKey ?? process.env.FIREBASE_VAPID_PUBLIC_KEY ?? null;
    return { ok: true as const, config: cfg, vapidKey };
  } catch (err) {
    return { ok: false as const, reason: "invalid_json", error: err instanceof Error ? err.message : String(err) };
  }
});
