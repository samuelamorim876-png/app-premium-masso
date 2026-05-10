import { createFileRoute } from "@tanstack/react-router";

/**
 * Serves the Firebase Cloud Messaging service worker with the public web config
 * inlined at runtime. Registered from the client with scope "/firebase-cloud-messaging-push-scope".
 */
export const Route = createFileRoute("/api/firebase-messaging-sw")({
  server: {
    handlers: {
      GET: async () => {
        const raw = process.env.FIREBASE_WEB_CONFIG_JSON ?? "{}";
        let cfg: any = {};
        try {
          cfg = JSON.parse(raw);
        } catch {
          cfg = {};
        }
        const safe = JSON.stringify({
          apiKey: cfg.apiKey ?? "",
          authDomain: cfg.authDomain ?? "",
          projectId: cfg.projectId ?? "",
          storageBucket: cfg.storageBucket ?? "",
          messagingSenderId: cfg.messagingSenderId ?? "",
          appId: cfg.appId ?? "",
        });

        const body = `// Firebase Cloud Messaging service worker (auto-generated)
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js");

firebase.initializeApp(${safe});
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw] Background message:", payload);
  const title = (payload.notification && payload.notification.title) || (payload.data && payload.data.title) || "Notificação";
  const body = (payload.notification && payload.notification.body) || (payload.data && payload.data.body) || "";
  const data = payload.data || {};
  self.registration.showNotification(title, {
    body,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data,
    tag: data.tag || "fcm-default",
    renotify: true,
    requireInteraction: true,
    vibrate: [200, 100, 200],
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/admin";
  const target = new URL(url, self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if (c.url === target && "focus" in c) return c.focus();
      }
      return self.clients.openWindow(target);
    })
  );
});
`;

        return new Response(body, {
          status: 200,
          headers: {
            "Content-Type": "application/javascript; charset=utf-8",
            "Service-Worker-Allowed": "/",
            "Cache-Control": "no-cache, no-store, must-revalidate",
          },
        });
      },
    },
  },
});
