import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Module } from "@/data/course-data";

export function useProgress(userId: string | undefined, modules?: Module[]) {
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [purchasedAt, setPurchasedAt] = useState<Date | null>(null);

  // Load progress + purchase date from database
  useEffect(() => {
    if (!userId) { setLoading(false); return; }

    Promise.all([
      supabase
        .from("lesson_progress")
        .select("lesson_id")
        .eq("user_id", userId),
      supabase
        .from("profiles")
        .select("purchased_at")
        .eq("id", userId)
        .single(),
    ]).then(([progressRes, profileRes]) => {
      if (!progressRes.error && progressRes.data) {
        setCompleted(new Set(progressRes.data.map((r) => r.lesson_id)));
      }
      if (!profileRes.error && profileRes.data?.purchased_at) {
        setPurchasedAt(new Date(profileRes.data.purchased_at));
      }
      setLoading(false);
    });
  }, [userId]);

  const mods = modules || [];

  const toggleLesson = useCallback(async (lessonId: string) => {
    if (!userId) return;

    const isCompleted = completed.has(lessonId);

    if (isCompleted) {
      setCompleted((prev) => { const n = new Set(prev); n.delete(lessonId); return n; });
      await supabase.from("lesson_progress").delete().eq("user_id", userId).eq("lesson_id", lessonId);
    } else {
      setCompleted((prev) => new Set(prev).add(lessonId));
      await supabase.from("lesson_progress").insert({ user_id: userId, lesson_id: lessonId });
    }
  }, [userId, completed]);

  const isLessonCompleted = useCallback(
    (lessonId: string) => completed.has(lessonId),
    [completed]
  );

  const getModuleProgress = useCallback(
    (moduleId: string) => {
      const mod = mods.find((m) => m.id === moduleId);
      if (!mod) return { completed: 0, total: 0, percent: 0 };
      const done = mod.lessons.filter((l) => completed.has(l.id)).length;
      return { completed: done, total: mod.lessons.length, percent: Math.round((done / mod.lessons.length) * 100) };
    },
    [completed, mods]
  );

  const isModuleUnlocked = useCallback(
    (moduleIndex: number) => {
      const mod = mods[moduleIndex];
      if (!mod) return false;

      const rule = mod.unlock;

      if (rule.kind === "immediate") return true;

      if (rule.kind === "days_after_purchase") {
        if (!purchasedAt) return false;
        const unlockDate = new Date(purchasedAt.getTime() + rule.days * 24 * 60 * 60 * 1000);
        return new Date() >= unlockDate;
      }

      if (rule.kind === "after_previous") {
        if (moduleIndex === 0) return true;
        const prevModule = mods[moduleIndex - 1];
        return prevModule.lessons.every((l) => completed.has(l.id));
      }

      return false;
    },
    [completed, purchasedAt, mods]
  );

  const daysUntilUnlock = useCallback(
    (moduleIndex: number) => {
      const mod = mods[moduleIndex];
      if (!mod || mod.unlock.kind !== "days_after_purchase" || !purchasedAt) return null;
      const unlockDate = new Date(purchasedAt.getTime() + mod.unlock.days * 24 * 60 * 60 * 1000);
      const diff = unlockDate.getTime() - Date.now();
      if (diff <= 0) return 0;
      return Math.ceil(diff / (24 * 60 * 60 * 1000));
    },
    [purchasedAt, mods]
  );

  const getUnlockInfo = useCallback(
    (moduleIndex: number): {
      kind: "immediate" | "days_after_purchase" | "after_previous";
      unlocked: boolean;
      unlockDate?: Date;
      daysLeft?: number;
      hoursLeft?: number;
      label?: string;
    } => {
      const mod = mods[moduleIndex];
      if (!mod) return { kind: "immediate", unlocked: false };
      const rule = mod.unlock;

      if (rule.kind === "immediate") return { kind: "immediate", unlocked: true };

      if (rule.kind === "after_previous") {
        if (moduleIndex === 0) return { kind: "after_previous", unlocked: true };
        const prev = mods[moduleIndex - 1];
        const unlocked = prev.lessons.every((l) => completed.has(l.id));
        return { kind: "after_previous", unlocked };
      }

      // days_after_purchase
      if (!purchasedAt) {
        return { kind: "days_after_purchase", unlocked: false, label: `Liberado ${rule.days} dias após a compra` };
      }
      const unlockDate = new Date(purchasedAt.getTime() + rule.days * 24 * 60 * 60 * 1000);
      const diff = unlockDate.getTime() - Date.now();
      if (diff <= 0) return { kind: "days_after_purchase", unlocked: true, unlockDate };

      const totalHours = Math.floor(diff / (60 * 60 * 1000));
      const daysLeft = Math.floor(totalHours / 24);
      const hoursLeft = totalHours % 24;

      let label: string;
      if (daysLeft >= 2) {
        label = `Disponível em ${daysLeft} dias`;
      } else if (daysLeft === 1) {
        label = hoursLeft > 0 ? `Liberado em 1 dia e ${hoursLeft}h` : "Liberado em 1 dia";
      } else if (totalHours >= 1) {
        label = `Liberado em ${totalHours}h`;
      } else {
        const minutes = Math.max(1, Math.ceil(diff / (60 * 1000)));
        label = `Liberado em ${minutes} min`;
      }

      return { kind: "days_after_purchase", unlocked: false, unlockDate, daysLeft, hoursLeft, label };
    },
    [completed, purchasedAt, mods]
  );

  const overallProgress = (() => {
    const totalLessons = mods.reduce((a, m) => a + m.lessons.length, 0);
    const percent = totalLessons === 0 ? 0 : Math.round((completed.size / totalLessons) * 100);
    return { completed: completed.size, total: totalLessons, percent };
  })();

  return { completed, loading, toggleLesson, isLessonCompleted, getModuleProgress, isModuleUnlocked, daysUntilUnlock, getUnlockInfo, overallProgress };
}
