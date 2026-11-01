/**
 * Runs `onTick` every `intervalMs` only while the page is visible.
 * - When the tab is hidden/minimized the timer is cleared (no requests at all).
 * - When the tab becomes visible again `onResume` runs immediately and the timer restarts.
 * Keeps the database from being woken up by tabs nobody is looking at.
 */
export type VisibilityPollerOptions = {
  intervalMs: number;
  onTick: () => void;
  onResume: () => void;
  doc?: Pick<Document, "visibilityState" | "addEventListener" | "removeEventListener">;
  win?: Pick<Window, "addEventListener" | "removeEventListener" | "setInterval" | "clearInterval">;
};

export function createVisibilityPoller({ intervalMs, onTick, onResume, doc, win }: VisibilityPollerOptions) {
  const d = doc ?? document;
  const w = win ?? window;
  let timer: ReturnType<typeof setInterval> | null = null;
  let wasHidden = d.visibilityState === "hidden";

  const start = () => {
    if (timer === null) timer = w.setInterval(onTick, intervalMs) as unknown as ReturnType<typeof setInterval>;
  };
  const pause = () => {
    if (timer !== null) {
      w.clearInterval(timer as unknown as number);
      timer = null;
    }
  };

  const onVisibility = () => {
    if (d.visibilityState === "hidden") {
      wasHidden = true;
      pause();
      return;
    }
    if (wasHidden) {
      wasHidden = false;
      onResume();
    }
    start();
  };

  // Page restored from the browser's back/forward cache: treat as a resume.
  const onPageShow = (event: Event) => {
    if ((event as PageTransitionEvent).persisted && d.visibilityState !== "hidden") {
      onResume();
      start();
    }
  };

  d.addEventListener("visibilitychange", onVisibility);
  w.addEventListener("pageshow", onPageShow);
  if (d.visibilityState !== "hidden") start();

  return {
    isRunning: () => timer !== null,
    stop: () => {
      pause();
      d.removeEventListener("visibilitychange", onVisibility);
      w.removeEventListener("pageshow", onPageShow);
    },
  };
}
