import { useEffect, useRef } from "react";
import { useLocation } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

interface ActivityInput {
  eventType: string;
  path?: string;
  moduleId?: string | null;
  moduleTitle?: string | null;
  lessonId?: string | null;
  lessonTitle?: string | null;
  lessonType?: string | null;
  metadata?: Record<string, unknown>;
}

function toUuid(value?: string | null) {
  if (!value) return null;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value) ? value : null;
}

async function writeActivity(userId: string, input: ActivityInput) {
  const now = new Date();
  const path = input.path ?? (typeof window !== "undefined" ? window.location.pathname : null);
  const moduleId = toUuid(input.moduleId);
  const lessonId = toUuid(input.lessonId);

  await Promise.all([
    supabase.from("student_engagement").upsert({
      user_id: userId,
      last_seen_at: now.toISOString(),
      online_until: new Date(now.getTime() + 90000).toISOString(),
      current_path: path,
      current_module_id: moduleId,
      current_lesson_id: lessonId,
    }, { onConflict: "user_id" }),
    supabase.from("student_activity_events").insert({
      user_id: userId,
      event_type: input.eventType,
      path,
      module_id: moduleId,
      module_title: input.moduleTitle ?? null,
      lesson_id: lessonId,
      lesson_title: input.lessonTitle ?? null,
      lesson_type: input.lessonType ?? null,
      metadata: input.metadata ?? {},
    }),
  ]);
}

export function recordStudentActivity(userId: string | undefined, input: ActivityInput) {
  if (!userId || typeof window === "undefined") return;
  writeActivity(userId, input).catch(() => {
    // Activity tracking must never interrupt studying or authentication.
  });
}

export function useStudentPresence(userId: string | undefined) {
  const location = useLocation();
  const lastTickRef = useRef<number | null>(null);
  const lastPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (!userId || typeof window === "undefined") return;

    let stopped = false;

    const sendHeartbeat = async (eventType = "heartbeat") => {
      if (stopped || document.visibilityState === "hidden") return;
      const now = Date.now();
      const previous = lastTickRef.current ?? now;
      const elapsed = Math.max(0, Math.min(120, Math.round((now - previous) / 1000)));
      lastTickRef.current = now;

      await supabase.from("student_engagement").upsert({
        user_id: userId,
        last_seen_at: new Date(now).toISOString(),
        online_until: new Date(now + 90000).toISOString(),
        total_usage_seconds: elapsed,
        current_path: window.location.pathname,
      }, { onConflict: "user_id" }).then(async () => {
        if (elapsed > 0) {
          await supabase.rpc("increment_student_usage", { _user_id: userId, _seconds: elapsed } as never).then(() => undefined);
        }
      });

      if (eventType !== "heartbeat") {
        await supabase.from("student_activity_events").insert({
          user_id: userId,
          event_type: eventType,
          path: window.location.pathname,
        });
      }
    };

    sendHeartbeat("session_start").catch(() => undefined);
    const interval = window.setInterval(() => sendHeartbeat().catch(() => undefined), 30000);
    const onVisible = () => {
      lastTickRef.current = Date.now();
      sendHeartbeat(document.visibilityState === "visible" ? "session_resume" : "session_pause").catch(() => undefined);
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      stopped = true;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [userId]);

  useEffect(() => {
    if (!userId || typeof window === "undefined") return;
    const pathname = location.pathname;
    if (lastPathRef.current === pathname) return;
    lastPathRef.current = pathname;
    recordStudentActivity(userId, { eventType: "page_view", path: pathname });
  }, [userId, location.pathname]);
}
