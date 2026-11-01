import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createVisibilityPoller } from "./visibility-poller";

function fakeEnv(initial: "visible" | "hidden") {
  const listeners = new Map<string, Set<(e: Event) => void>>();
  const target = {
    addEventListener: (type: string, fn: (e: Event) => void) => {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type)!.add(fn);
    },
    removeEventListener: (type: string, fn: (e: Event) => void) => listeners.get(type)?.delete(fn),
  };
  const doc = { ...target, visibilityState: initial as DocumentVisibilityState };
  const win = {
    ...target,
    setInterval: (fn: () => void, ms: number) => setInterval(fn, ms),
    clearInterval: (id: number) => clearInterval(id),
  };
  const fire = (type: string, e: Event = new Event(type)) => listeners.get(type)?.forEach((fn) => fn(e));
  const setVisibility = (v: "visible" | "hidden") => {
    doc.visibilityState = v;
    fire("visibilitychange");
  };
  return { doc: doc as never, win: win as never, setVisibility };
}

describe("createVisibilityPoller", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("checks every 5 minutes while the app is visible", () => {
    const env = fakeEnv("visible");
    const onTick = vi.fn();
    createVisibilityPoller({ intervalMs: 300000, onTick, onResume: vi.fn(), doc: env.doc, win: env.win });
    vi.advanceTimersByTime(300000 * 3);
    expect(onTick).toHaveBeenCalledTimes(3);
  });

  it("makes no checks while the app is minimized", () => {
    const env = fakeEnv("visible");
    const onTick = vi.fn();
    createVisibilityPoller({ intervalMs: 300000, onTick, onResume: vi.fn(), doc: env.doc, win: env.win });
    env.setVisibility("hidden");
    vi.advanceTimersByTime(300000 * 10);
    expect(onTick).toHaveBeenCalledTimes(0);
  });

  it("checks immediately when the student returns to the app", () => {
    const env = fakeEnv("visible");
    const onResume = vi.fn();
    const onTick = vi.fn();
    createVisibilityPoller({ intervalMs: 300000, onTick, onResume, doc: env.doc, win: env.win });
    env.setVisibility("hidden");
    env.setVisibility("visible");
    expect(onResume).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(300000);
    expect(onTick).toHaveBeenCalledTimes(1);
  });

  it("does not start polling when opened in a hidden tab", () => {
    const env = fakeEnv("hidden");
    const onTick = vi.fn();
    const poller = createVisibilityPoller({ intervalMs: 60000, onTick, onResume: vi.fn(), doc: env.doc, win: env.win });
    vi.advanceTimersByTime(60000 * 5);
    expect(onTick).toHaveBeenCalledTimes(0);
    expect(poller.isRunning()).toBe(false);
  });
});
