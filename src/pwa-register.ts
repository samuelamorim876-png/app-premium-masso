// PWA service worker registration guard
// Only allows SW in production, outside iframes and preview hosts
// VitePWA handles actual registration via its generated module

export function registerPWA() {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;

  const isInIframe = (() => {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  })();

  const isPreviewHost =
    window.location.hostname.includes("id-preview--") ||
    window.location.hostname.includes("lovableproject.com") ||
    window.location.hostname.includes("lovableproject-dev.com") ||
    window.location.hostname.includes("preview--");

  if (isPreviewHost || isInIframe) {
    // Unregister any service workers in preview/iframe contexts
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((r) => r.unregister());
    });
  }
}
