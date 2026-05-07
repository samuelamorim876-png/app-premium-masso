// Kill-switch service worker — cleans up caches and unregisters itself
self.addEventListener("install", (e) => e.waitUntil(self.skipWaiting()));
self.addEventListener("activate", (e) => e.waitUntil((async () => {
  await self.clients.claim();
  const names = await caches.keys();
  await Promise.all(names.map((n) => caches.delete(n)));
  await self.registration.unregister();
})()));
